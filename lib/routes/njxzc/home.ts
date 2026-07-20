import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parsePubDate, resolveArticles } from './utils';

const pageUrl = 'https://www.njxzc.edu.cn/89/list.htm';

export const route: Route = {
    path: '/tzgg',
    categories: ['university'],
    example: '/njxzc/tzgg',
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
            source: ['www.njxzc.edu.cn/89/list.htm', 'www.njxzc.edu.cn/'],
        },
    ],
    name: '官网通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'www.njxzc.edu.cn/89/list.htm',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = $('.news_list .news')
        .toArray()
        .map((el) => {
            const $item = $(el);
            const $link = $item.find('a');
            const href = $link.attr('href');
            if (!href) {
                return null;
            }
            return {
                title: $link.attr('title') || $link.text().trim(),
                link: new URL(href, pageUrl).href,
                pubDate: parsePubDate($item.find('.news_meta').text()),
            };
        })
        .filter((item) => item !== null);

    return {
        title: '南京晓庄学院 -- 通知公告',
        link: pageUrl,
        item: await resolveArticles(list),
    };
}
