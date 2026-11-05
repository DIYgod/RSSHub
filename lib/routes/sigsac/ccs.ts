import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const url = 'https://www.sigsac.org/';
// https://www.sigsac.org/ccs/CCS2022/program/accepted-papers.html

export const route: Route = {
    path: '/ccs',
    categories: ['journal'],
    example: '/sigsac/ccs',
    radar: [
        {
            source: ['sigsac.org/ccs.html', 'sigsac.org/'],
        },
    ],
    name: 'The ACM Conference on Computer and Communications Security',
    maintainers: ['ZeddYu'],
    handler,
    url: 'sigsac.org/ccs.html',
    description: 'Return results from 2020',
};

async function handler() {
    const last = new Date().getFullYear() + 1;
    const yearList = Array.from({ length: last - 2020 }, (_, v) => `${url}ccs/CCS${v + 2020}/`);
    const yearResponses = await Promise.allSettled(yearList.map((url) => ofetch(url)));

    const urlList = yearResponses
        .map((response, i) => {
            if (response.status !== 'fulfilled') {
                return;
            }
            const $ = load(response.value);
            const anchor = $('a[href]')
                .toArray()
                .find((element) => $(element).text().replaceAll(/\s+/g, ' ').trim() === 'Accepted Papers');
            const href = anchor && $(anchor).attr('href');
            const program = $('a[href]')
                .toArray()
                .find((element) => $(element).text().replaceAll(/\s+/g, ' ').trim() === 'Program');
            const programHref = program && $(program).attr('href');
            return href ? new URL(href, yearList[i]).href : programHref ? new URL(programHref, yearList[i]).href : undefined;
        })
        .filter(Boolean);

    const responses = await Promise.allSettled(urlList.map((url) => ofetch(url!)));

    const items = (await Promise.all(responses.map((response, i) => (response.status === 'fulfilled' ? parseAcceptedPage(response.value, urlList[i]!) : [])))).flat();

    return {
        title: 'ACM CCS',
        link: url,
        description: 'The ACM Conference on Computer and Communications Security (CCS) Accepted Papers',
        item: items,
    };
}

async function parseAcceptedPage(html: string, link: string): Promise<DataItem[]> {
    const $ = load(html);
    if ($('#acceptPaper').length) {
        const source = $('script[src]')
            .toArray()
            .map((element) => $(element).attr('src'))
            .find((src) => src?.startsWith('assets/js/program.js'));
        if (!source) {
            throw new Error('ACM CCS program is missing its public paper data script');
        }
        const documents = await cache.tryGet(`sigsac:program:v1:${link}`, async () => {
            const script = await ofetch(new URL(source, link).href, { responseType: 'text' });
            const paperPath = script.match(/paperRequest\.open\(["']GET["'],\s*["']([^"'?]+)\?ver=/)?.[1];
            const authorPath = script.match(/authorRequest\.open\(["']GET["'],\s*["']([^"'?]+)\?ver=/)?.[1];
            if (!paperPath || !authorPath) {
                throw new Error('ACM CCS program is missing its public paper or author data URL');
            }
            const [papers, authors] = await Promise.all([ofetch(new URL(paperPath, link).href, { responseType: 'text' }), ofetch(new URL(authorPath, link).href, { responseType: 'text' })]);
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
            .map((element) => {
                const paper = papers(element);
                const title = paper.find('title').text();
                return {
                    title,
                    link: new URL(`#${title}`, link).href,
                    author: paper
                        .find('authors')
                        .text()
                        .split(',')
                        .map((id) => {
                            const name = authorNames.get(id);
                            if (!name) {
                                throw new Error(`ACM CCS program is missing author ${id}`);
                            }
                            return { name };
                        }),
                };
            });
    }
    const paperSection = $('div.papers-item')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const title = $item.find('b').text();
            return {
                title,
                author: $item.find('p').text().trim().replaceAll('\n', '').replaceAll(/\s+/g, ' '),
                link: `${link}#${title.trim()}`,
            };
        });
    const paperTable = $('tbody tr')
        .toArray()
        .filter((row) => $(row).find('td').length >= 2)
        .map((item) => {
            const $item = $(item);
            const title = $item.find('td').eq(0).text();
            return {
                title,
                author: $item.find('td').eq(1).text().trim().replaceAll('\n', '').replaceAll(/\s+/g, ' '),
                link: `${link}#${title.trim()}`,
            };
        });
    return paperSection.length ? paperSection : paperTable;
}
