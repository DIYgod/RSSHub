import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { parsePubDate, resolveArticles } from './utils';

const pageUrl = 'https://lib.njxzc.edu.cn/pxyhd/list.htm';

export const route: Route = {
    path: '/libtzgg',
    categories: ['university'],
    example: '/njxzc/libtzgg',
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
            source: ['lib.njxzc.edu.cn/pxyhd/list.htm', 'lib.njxzc.edu.cn/'],
        },
    ],
    name: '图书馆通知公告',
    maintainers: ['real-jiakai'],
    handler,
    url: 'lib.njxzc.edu.cn/pxyhd/list.htm',
};

async function handler() {
    const response = await ofetch(pageUrl);
    const $ = load(response);

    const list = $('a.btt-2')
        .toArray()
        .map((el) => {
            const $link = $(el);
            const href = $link.attr('href');
            if (!href) {
                return null;
            }
            const day = $link.find('.tm-1').text().trim();
            const yearMonth = $link.find('.tm-2').text().trim();
            return {
                title: $link.find('.btt-4').text().trim(),
                link: new URL(href, pageUrl).href,
                pubDate: parsePubDate(`${yearMonth}-${day}`),
            };
        })
        .filter((item) => item !== null);

    return {
        title: '南京晓庄学院 -- 图书馆通知公告',
        link: pageUrl,
        item: await resolveArticles(list),
    };
}
