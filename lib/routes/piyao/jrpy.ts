import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.piyao.org.cn';

export const route: Route = {
    path: '/jrpy',
    categories: ['other'],
    example: '/piyao/jrpy',
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
            source: ['piyao.org.cn/jrpy/index.htm'],
        },
    ],
    name: '今日辟谣',
    maintainers: ['Fatpandac'],
    handler,
    url: 'piyao.org.cn/jrpy/index.htm',
};

async function handler() {
    const currentUrl = `${rootUrl}/jrpy/index.htm`;

    const response = await got(currentUrl);
    const $ = load(response.data);
    const list = $('ul#list li')
        .toArray()
        .map((item) => ({
            title: $(item).find('a').text(),
            link: new URL($(item).find('a').attr('href'), rootUrl).href,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = load(detailResponse.data);

                item.title = content('div.con_tit > h2').text();
                item.description = content('div.con_txt').html();
                item.pubDate = parseDate(content('div.con_tit > p > span').text().split('时间：')[1]);

                return item;
            })
        )
    );

    return {
        title: '今日辟谣',
        link: currentUrl,
        item: items,
    };
}
