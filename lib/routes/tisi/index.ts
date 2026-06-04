import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.tisi.org';

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
        .map((item) => ({
            title: $(item).find('p.new-article-title > a').text(),
            link: new URL($(item).find('p.new-article-title > a').attr('href'), rootUrl).href,
            pubDate: parseDate($(item).find('p.new-article-date > span.left-span').text()),
            category: $(item).find('p.new-article-date > span:nth-child(1)').text(),
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);
                item.description = content('div.article-content').html();

                return item;
            })
        )
    );

    return {
        title: '腾讯研究院 - 最近更新',
        link: url,
        item: items,
    };
}
