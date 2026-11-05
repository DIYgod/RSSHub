import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.tisi.org';

const getArticle = (url: string) =>
    cache.tryGet(`tisi:article:${url}`, async () => {
        const response = await got(url);
        const $ = load(response.data);
        return { description: $('div.article-content').html() ?? undefined };
    });

export const route: Route = {
    path: '/latest',
    categories: ['new-media'],
    example: '/tisi/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最近更新',
    maintainers: ['Fatpandac'],
    handler,
};

async function handler() {
    const url = `${rootUrl}/?page_id=11151`;

    const response = await got(url);
    const $ = load(response.data);
    const list = $('div.new-artice-list-box')
        .toArray()
        .map((item): DataItem => ({
            title: $(item).find('p.new-article-title > a').text(),
            link: new URL($(item).find('p.new-article-title > a').attr('href')!, rootUrl).href,
            pubDate: parseDate($(item).find('p.new-article-date > span.left-span').text()),
            category: $(item).find('p.new-article-date > span:nth-child(1)').text(),
        }));

    const items = await pMap(list, async (item): Promise<DataItem> => ({ ...item, ...(await getArticle(item.link!)) }), { concurrency: 3 });

    return {
        title: '腾讯研究院 - 最近更新',
        link: url,
        item: items,
    };
}
