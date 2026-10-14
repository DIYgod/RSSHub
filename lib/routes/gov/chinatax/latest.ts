import { load } from 'cheerio';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/latest',
    categories: ['government'],
    example: '/gov/chinatax/latest',
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
            source: ['fgk.chinatax.gov.cn/zcfgk/c100027/list.html'],
            target: '/latest',
        },
        {
            source: ['www.chinatax.gov.cn/*'],
        },
    ],
    name: '最新文件',
    maintainers: ['nczitzk', 'fuzy112'],
    handler,
    url: 'fgk.chinatax.gov.cn/zcfgk/c100027/list.html',
};

async function handler() {
    const link = 'https://fgk.chinatax.gov.cn/zcfgk/c100027/list.html';

    const response = await got({
        method: 'get',
        url: link,
    });
    const $ = load(response.data);
    const list = $('.list > ul > li')
        .slice(0, 10)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            const a = $item.find('a');
            return {
                title: a.find('.bt').text(),
                link: new URL(a.attr('href')!, link).href,
            };
        });
    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link!, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = load(res.data);
                const pubDate = content('meta[name="PubDate"]').attr('content');
                if (pubDate) {
                    item.pubDate = timezone(parseDate(pubDate), 8);
                }
                item.description = content('.arc_cont').html();
                return item;
            })
        )
    );

    return {
        title: '国家税务总局 - 最新文件',
        link,
        item: items,
    };
}
