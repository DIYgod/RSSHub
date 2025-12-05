import { load } from 'cheerio'; // 可以使用类似 jQuery 的 API HTML 解析器

import type { Route } from '@/types';
import cache from '@/utils/cache';
// 导入必要的模组
import got from '@/utils/got'; // 自订的 got
import { parseDate } from '@/utils/parse-date';

import { getPageItemAndDate } from './utils';

export const route: Route = {
    path: '/notice',
    categories: ['university'],
    example: '/jsu/notice',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '通知公告',
    maintainers: ['wenjia03'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.jsu.edu.cn/';

    const response = await got({
        method: 'get',
        url: 'https://www.jsu.edu.cn/index/tzgg.htm',
    });

    const $ = load(response.data);
    const list = $('body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > div:nth-child(2) > ul > li').toArray();
    const out = await Promise.all(
        list.map((item) => {
            item = $(item);
            const link = new URL(item.find('a').attr('href'), baseUrl).href;
            return cache.tryGet(link, async () => {
                const description = await getPageItemAndDate(
                    '#vsb_content',
                    link,
                    'body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > form > div > h1',
                    'body > div.container.container-fluid.dynava.no-padding.cleafix > div.con_wz_fr.fr.cleafix > form > div > div:nth-child(2)',
                    (date) => date.split('时间：')[1].split(' 作者：')[0]
                );
                const pubDate = parseDate(description.date, 'YYYY-MM-DD');
                return {
                    title: description.title,
                    link,
                    pubDate,
                    description: description.pageInfo,
                    category: '通知公告',
                };
            });
        })
    );

    return {
        // 在此处输出您的 RSS
        title: '吉首大学 - 通知公告',
        link: 'https://www.jsu.edu.cn/index/tzgg.htm',
        description: '吉首大学 - 通知公告',
        item: out,
    };
}
