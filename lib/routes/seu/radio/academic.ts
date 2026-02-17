import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/radio/academic',
    categories: ['university'],
    example: '/seu/radio/academic',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['radio.seu.edu.cn/_s29/15986/list.psp', 'radio.seu.edu.cn/'],
        },
    ],
    name: '信息科学与工程学院学术活动',
    maintainers: ['HenryQW'],
    handler,
    url: 'radio.seu.edu.cn/_s29/15986/list.psp',
};

async function handler() {
    const host = 'https://radio.seu.edu.cn';
    const link = new URL('_s29/15986/list.psp', host).href;
    const response = await got(link);

    const $ = load(response.data);

    const list = $('.list_item')
        .toArray()
        .map((e) => {
            e = $(e);
            const a = e.find('.Article_Title a');
            return {
                title: a.attr('title'),
                link: new URL(a.attr('href'), host).href,
                pubDate: parseDate(e.find('.Article_PublishDate').text()),
            };
        });

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await got(item.link);
                const $ = load(response.data);

                item.author = $('.arti_publisher').text().replace('发布者：', '');
                item.description = $('.wp_articlecontent').html();

                return item;
            })
        )
    );

    return {
        title: '东南大学信息科学与工程学院 -- 学术活动',
        link,
        item: out,
    };
}
