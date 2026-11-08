import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const url = 'https://www.sigsac.org/';
const minYear = 2020;
/*
 * CCS does not keep a stable accepted-papers layout across years:
 *   2020-2021: accepted-papers.html with div.papers-item
 *   2022, 2024, 2026: program/accepted-papers.html tables
 *   2023: program.html with #acceptPaper data loaded by JS
 *   2025: Next.js accepted-papers page backed by assets/accepted-papers.json
 * The ordered candidates are intentional: prefer HTML when it exists, then JSON,
 * then the older root and program.html layouts. Do not collapse them into one URL.
 */
const acceptedPaperSources = [
    { type: 'html', path: 'program/accepted-papers.html' },
    { type: 'json', path: 'assets/accepted-papers.json' },
    { type: 'html', path: 'accepted-papers.html' },
    { type: 'html', path: 'program.html' },
] as const;

type AcceptedPaper = {
    title: string;
    authors?: Array<{ name: string }>;
};

type AcceptedPapersJson = {
    firstCycle?: AcceptedPaper[];
    secondCycle?: AcceptedPaper[];
};

type YearPage = { pageUrl: string; html: string } | { pageUrl: string; json: AcceptedPapersJson };

export const route: Route = {
    path: '/ccs/:year?',
    categories: ['journal'],
    example: '/sigsac/ccs',
    radar: [
        {
            source: ['sigsac.org/ccs.html', 'sigsac.org/'],
        },
    ],
    name: 'The ACM Conference on Computer and Communications Security',
    maintainers: ['ZeddYu', 'yuguorui'],
    handler,
    url: 'sigsac.org/ccs.html',
    description: 'Return accepted papers from 2020 through the current year + 1. Specify a year in the path to return a single year.',
    parameters: {
        year: '4-digit year, for example `2026`. Without it, all available years from 2020 through the current year + 1 are returned.',
    },
};

async function handler(ctx: Context): Promise<Data> {
    const years = getYears(ctx);
    const pages = await Promise.all(years.map((year) => fetchYearPage(year)));
    const items = (await Promise.all(pages.map((page) => (page ? parseYearPage(page) : [])))).flat();

    return {
        title: 'ACM CCS',
        link: url,
        description: 'The ACM Conference on Computer and Communications Security (CCS) Accepted Papers',
        item: items,
    };
}

function getYears(ctx: Context): number[] {
    const maxYear = new Date().getFullYear() + 1;
    const yearParam = ctx.req.param('year');

    if (yearParam !== undefined) {
        const year = Number(yearParam);
        if (!/^\d{4}$/.test(yearParam) || year < minYear || year > maxYear) {
            throw new InvalidParameterError(`year must be a 4-digit year between ${minYear} and ${maxYear}`);
        }
        return [year];
    }

    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index);
}

async function fetchYearPage(year: number, sourceIndex = 0): Promise<YearPage | undefined> {
    if (sourceIndex >= acceptedPaperSources.length) {
        return;
    }

    const source = acceptedPaperSources[sourceIndex];
    const pageUrl = `${url}ccs/CCS${year}/${source.path}`;
    try {
        if (source.type === 'json') {
            const json = await ofetch<AcceptedPapersJson>(pageUrl);
            if (isAcceptedPapersJson(json)) {
                return { pageUrl, json };
            }
        } else {
            const html = await ofetch<string>(pageUrl);
            return { pageUrl, html };
        }
    } catch {
        // Try the next known layout for this year.
    }

    return fetchYearPage(year, sourceIndex + 1);
}

function isAcceptedPapersJson(value: AcceptedPapersJson): boolean {
    return Array.isArray(value?.firstCycle) || Array.isArray(value?.secondCycle);
}

function parseYearPage(page: YearPage): DataItem[] | Promise<DataItem[]> {
    return 'json' in page ? parseAcceptedPapersJson(page.json, page.pageUrl) : parseAcceptedPage(page.html, page.pageUrl);
}

function parseAcceptedPage(html: string, pageUrl: string): DataItem[] | Promise<DataItem[]> {
    const $ = load(html);
    const seenLinks = new Set<string>();

    // 2023 is the only year that hides the paper list behind program.js and XML data.
    if ($('#acceptPaper').length) {
        return parseProgramPage($, pageUrl, seenLinks);
    }

    // Newer pages use tables; 2020 and 2021 still use div.papers-item blocks.
    const tableItems = parsePaperTables($, pageUrl, seenLinks);
    return tableItems.length ? tableItems : parseLegacyPapers($, pageUrl, seenLinks);
}

async function parseProgramPage($: CheerioAPI, pageUrl: string, seenLinks: Set<string>): Promise<DataItem[]> {
    const source = $('script[src]')
        .toArray()
        .map((element) => $(element).attr('src'))
        .find((src) => src?.startsWith('assets/js/program.js'));
    if (!source) {
        throw new Error('ACM CCS program is missing its public paper data script');
    }

    const documents = await cache.tryGet(`sigsac:program:v1:${pageUrl}`, async () => {
        const script = await ofetch(new URL(source, pageUrl).href, { responseType: 'text' });
        const paperPath = script.match(/paperRequest\.open\(["']GET["'],\s*["']([^"'?]+)\?ver=/)?.[1];
        const authorPath = script.match(/authorRequest\.open\(["']GET["'],\s*["']([^"'?]+)\?ver=/)?.[1];
        if (!paperPath || !authorPath) {
            throw new Error('ACM CCS program is missing its public paper or author data URL');
        }
        const [papers, authors] = await Promise.all([ofetch(new URL(paperPath, pageUrl).href, { responseType: 'text' }), ofetch(new URL(authorPath, pageUrl).href, { responseType: 'text' })]);
        return { papers, authors };
    });

    const papers = load(documents.papers, { xml: true });
    const authors = load(documents.authors, { xml: true });
    const authorNames = new Map(
        authors('author')
            .toArray()
            .map((element) => [authors(element).find('id').text(), authors(element).find('name').text()])
    );

    return papers('paper')
        .toArray()
        .flatMap((element) => {
            const paper = papers(element);
            const title = paper.find('title').text();
            const linkTitle = normalizeText(title);
            if (!linkTitle) {
                return [];
            }
            const author = paper
                .find('authors')
                .text()
                .split(',')
                .map((id) => {
                    const name = authorNames.get(id);
                    if (!name) {
                        throw new Error(`ACM CCS program is missing author ${id}`);
                    }
                    return { name };
                });
            return [createItem({ title, linkTitle, author, pageUrl, seenLinks })];
        });
}

function parsePaperTables($: CheerioAPI, pageUrl: string, seenLinks: Set<string>): DataItem[] {
    const items: DataItem[] = [];

    $('table').each((_, table) => {
        const $table = $(table);
        const cycle = getCycle($, table);

        for (const row of $table.find('tr').toArray()) {
            const $cells = $(row).find('td');
            if ($cells.length < 2) {
                continue;
            }

            const $titleCell = $cells.eq(0);
            const title = getCellText($titleCell, ' ');
            const linkTitle = normalizeText(title);
            if (!linkTitle || /^title$/i.test(linkTitle)) {
                continue;
            }

            const $authorCell = $cells.eq(1);
            items.push(
                createItem({
                    title,
                    linkTitle,
                    author: getCellText($authorCell),
                    pageUrl,
                    cycle,
                    seenLinks,
                })
            );
        }
    });

    return items;
}

function parseLegacyPapers($: CheerioAPI, pageUrl: string, seenLinks: Set<string>): DataItem[] {
    return $('div.papers-item')
        .toArray()
        .flatMap((element) => {
            const $item = $(element);
            const title = getCellText($item.find('b').first(), ' ');
            const linkTitle = normalizeText(title);
            if (!linkTitle) {
                return [];
            }
            return [
                createItem({
                    title,
                    linkTitle,
                    author: getCellText($item.find('p').first()),
                    pageUrl,
                    seenLinks,
                }),
            ];
        });
}

function parseAcceptedPapersJson(data: AcceptedPapersJson, pageUrl: string): DataItem[] {
    const seenLinks = new Set<string>();
    const cycles: Array<[string, AcceptedPaper[] | undefined]> = [
        ['First Cycle', data.firstCycle],
        ['Second Cycle', data.secondCycle],
    ];

    return cycles.flatMap(([cycle, papers]) =>
        (papers ?? []).flatMap((paper) => {
            const linkTitle = normalizeText(paper.title);
            if (!linkTitle) {
                return [];
            }
            const author = paper.authors
                ?.map((paperAuthor) => paperAuthor.name)
                .filter(Boolean)
                .join(', ');
            return [createItem({ title: paper.title, linkTitle, author, pageUrl, cycle, seenLinks })];
        })
    );
}

function getCycle($: CheerioAPI, table: Element): string | undefined {
    const $table = $(table);
    const $heading = $table.prevAll('h2, h3').first();
    const $parentHeading = $table.parent().prevAll('h2, h3').first();
    const heading = normalizeText($heading.text()) || normalizeText($parentHeading.text());

    // A generic "Accepted Papers" heading is not a cycle label.
    return heading && !/^accepted papers?$/i.test(heading) ? heading : undefined;
}

function getCellText($cell: Cheerio<Element>, separator = ', '): string {
    $cell.find('br').replaceWith(separator);
    return $cell.text();
}

function createItem({ title, linkTitle, author, pageUrl, cycle, seenLinks }: { title: string; linkTitle: string; author: DataItem['author']; pageUrl: string; cycle?: string; seenLinks: Set<string> }): DataItem {
    const encodedTitle = encodeURIComponent(linkTitle);
    let link = `${pageUrl}#${encodedTitle}`;
    let duplicateIndex = 2;
    while (seenLinks.has(link)) {
        link = `${pageUrl}#${encodedTitle}-${duplicateIndex}`;
        duplicateIndex++;
    }
    seenLinks.add(link);

    return {
        title,
        author,
        link,
        category: cycle ? [cycle] : undefined,
    };
}

function normalizeText(value: string): string {
    return value.replaceAll(/\s+/g, ' ').trim();
}
