import { load } from 'cheerio';
import iconv from 'iconv-lite';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

type Edition = {
    title: string;
    link: string;
};

type Article = {
    title: string;
    link: string;
    category: string[];
    dateText?: string;
};

const rootUrl = 'https://newspaper.jcrb.com';
const rootPageUrl = rootUrl + '/';

const fetchPage = async (url: string) => {
    const { data } = await got({
        method: 'get',
        url,
        responseType: 'buffer',
        headers: {
            'User-Agent': config.trueUA,
        },
    });

    return iconv.decode(data, 'gbk');
};

const extractIssueInfo = (html: string) => {
    const issueMatch = html.match(/(?:\.\/)?(\d{4}\/\d{8}\/\d{8}_\d{3}\/\d{8}_\d{3}_\d+\.htm)/);

    if (!issueMatch) {
        throw new Error('Failed to detect the latest issue path from the homepage.');
    }

    const issuePath = issueMatch[1];
    const [year, ymd] = issuePath.split('/');

    if (!year || !ymd) {
        throw new Error('Failed to parse issue date from the homepage link.');
    }

    return { year, ymd };
};

const parseEditionList = ($: ReturnType<typeof load>, baseUrl: string): Edition[] =>
    $('div.bancititle a')
        .toArray()
        .map((element) => {
            const item = $(element);
            const href = item.attr('href');

            if (!href) {
                return null;
            }

            return {
                title: item.text().trim(),
                link: new URL(href, baseUrl).href,
            };
        })
        .filter((item): item is Edition => item !== null);

const parseArticleList = ($: ReturnType<typeof load>, baseUrl: string, editionTitle: string, editionDate?: string): Article[] =>
    $('area.areablock')
        .toArray()
        .map<Article | null>((element) => {
            const item = $(element);
            const href = item.attr('href');
            const title = item.attr('name') || item.attr('title') || '';

            if (!href || !title) {
                return null;
            }

            return {
                title,
                link: new URL(href, baseUrl).href,
                category: [editionTitle],
                dateText: editionDate,
            };
        })
        .filter((item): item is Article => item !== null);

const extractDetail = (html: string, fallbackTitle: string, fallbackDate?: string) => {
    const $ = load(html);

    const title = $('td.font01').first().text() || fallbackTitle;
    const font02Texts = $('td.font02')
        .toArray()
        .map((element) => $(element).text().trim())
        .filter(Boolean);
    const author = font02Texts.length > 1 ? font02Texts.at(-1) : undefined;

    const content = $('td.font6').first();
    content.find('#ozoom').remove();

    const contentHtml = content.length ? content.html() : undefined;
    const metaDescription = $('meta[name="description"]').attr('content');
    const description = contentHtml && contentHtml.trim() ? contentHtml : metaDescription?.trim() || undefined;

    const dateText = $('span.default').first().text() || fallbackDate;
    const pubDate = dateText ? timezone(parseDate(dateText, 'YYYY年MM月DD日'), +8) : undefined;

    return {
        title,
        author,
        description,
        pubDate,
    };
};

async function handler(ctx) {
    const rootHtml = await fetchPage(rootPageUrl);
    const { year, ymd } = extractIssueInfo(rootHtml);

    const issueListUrl = rootUrl + '/' + year + '/' + ymd + '/' + ymd + '_plist.htm';
    const issueListHtml = await fetchPage(issueListUrl);
    const issueListPage = load(issueListHtml);

    const editions = parseEditionList(issueListPage, issueListUrl);

    if (!editions.length) {
        throw new Error('No edition list found on the latest issue page.');
    }

    const editionResults = await Promise.all(
        editions.map(async (edition) => {
            const editionHtml = await fetchPage(edition.link);
            const $ = load(editionHtml);
            const editionTitle = $('td[width="202"]').first().text() || edition.title;
            const editionDate = $('span.default').first().text() || undefined;

            return parseArticleList($, edition.link, editionTitle, editionDate);
        })
    );

    const rawItems = editionResults.flat();
    const seenLinks = new Set<string>();
    const uniqueItems = rawItems.filter((item) => {
        if (seenLinks.has(item.link)) {
            return false;
        }
        seenLinks.add(item.link);
        return true;
    });

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : undefined;
    const itemsToFetch = limit ? uniqueItems.slice(0, limit) : uniqueItems;

    const items = await Promise.all(
        itemsToFetch.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailHtml = await fetchPage(item.link);
                const { dateText, ...baseItem } = item;
                const detail = extractDetail(detailHtml, baseItem.title, dateText);

                return {
                    ...baseItem,
                    ...detail,
                };
            })
        )
    );

    return {
        title: '检察日报数字报',
        link: issueListUrl,
        item: items,
    };
}

export const route: Route = {
    path: '/newspaper',
    categories: ['traditional-media'],
    example: '/jcrb/newspaper',
    radar: [
        {
            source: ['newspaper.jcrb.com/'],
            target: '/newspaper',
        },
    ],
    name: '数字报',
    maintainers: ['ZHA30'],
    handler,
    description: '抓取检察日报数字报最新一期全部版面文章。',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
};
