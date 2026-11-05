import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
// Adapted from the university news route.
const baseUrl = 'https://jwc.wfu.edu.cn/7448/list.htm';
const sizeTitle = '潍坊学院教务处新闻';
export const route: Route = {
    path: '/jwc',
    categories: ['university'],
    example: '/wfu/jwc',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jwc.wfu.edu.cn/', 'jwc.wfu.edu.cn/7448/list.htm'],
        },
    ],
    name: '教务处通知',
    maintainers: ['cccht'],
    handler,
    url: 'jwc.wfu.edu.cn/',
};
function parsePublicationDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DD', true);
    // UTC midnight encodes the source calendar date, not a publication instant.
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
async function getArticleDetail(link: string) {
    const { data } = await got.get(link);
    const $ = load(data);
    const body = $('div.wp_articlecontent');
    if (body.length !== 1) {
        throw new Error(`Article body not found at ${link}`);
    }
    body.find('[pdfsrc]').each((_, element) => {
        const pdfUrl = new URL($(element).attr('pdfsrc')!, link).href;
        $(element).replaceWith($('<p></p>').append($('<a></a>').attr('href', pdfUrl).text('查看文档')));
    });
    return { description: body.html() ?? undefined };
}
async function handler() {
    const response = await got({
        method: 'get',
        url: baseUrl,
        headers: {
            Referer: 'https://jwc.wfu.edu.cn/',
        },
    });
    const $ = load(response.data);
    // Read the first-page article list.
    const list = $('ul.wp_article_list>li');
    const items = list.toArray().map((item) => {
        const $item = $(item);
        const anchor = $item.find('div.pr_fields > span.Article_Title > a');
        const link = new URL(anchor.attr('href')!, baseUrl).href;
        return {
            title: anchor.attr('title') || anchor.text(),
            pubDate: parsePublicationDate($item.find('span.Article_PublishDate').text().trim()),
            link,
            guid: link,
        };
    });
    const result = await unwrapFirstFailure(
        pMap(
            items,
            async (item) => {
                if (new URL(item.link).hostname !== 'jwc.wfu.edu.cn') {
                    return item;
                }
                try {
                    const detail = await cache.tryGet(`wfu:jwc:article:${item.link}`, () => getArticleDetail(item.link));
                    return { ...item, description: detail.description };
                } catch (error) {
                    if (error instanceof Error && error.name === 'FetchError') {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: sizeTitle,
        link: baseUrl,
        description: '潍坊学院教务处通知（通知为文件需下载）',
        item: result,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
