import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/gs',
    categories: ['university'],
    example: '/tongji/gs',
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
            source: ['gs.tongji.edu.cn/tzgg.htm', 'gs.tongji.edu.cn/'],
        },
    ],
    name: '研究生院通知公告',
    maintainers: ['sitdownkevin'],
    handler,
    url: 'gs.tongji.edu.cn/tzgg.htm',
};

async function getNoticeContent(item) {
    const response = await got(item.link);
    const $ = load(response.body);
    const content = $('#vsb_content').html();
    item.description = content;
    return item;
}

async function handler() {
    const baseUrl = 'https://gs.tongji.edu.cn';
    const response = await got(`${baseUrl}/tzgg.htm`);
    const $ = load(response.body);
    const container = $('body > div > div.con_list.ma0a > div > div.list_content_right > div.list_list > ul');
    const items = container
        .find('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a').attr('title');
            const linkRaw = $(item).find('a').attr('href');
            const link = linkRaw.startsWith('http') ? linkRaw : `${baseUrl}/${linkRaw}`;
            const pubDate = $(item).find('span').text();
            return { title, link, pubDate: parseDate(pubDate, 'YYYY-MM-DD') };
        });

    const itemsWithContent = await Promise.all(items.map((item) => cache.tryGet(item.link, () => getNoticeContent(item))));

    return {
        title: '同济大学研究生院',
        link: baseUrl,
        description: '同济大学研究生院通知公告',
        image: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        icon: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        logo: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        item: itemsWithContent,
    };
}
