import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/yjs',
    categories: ['university'],
    example: '/tongji/yjs',
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
            source: ['yz.tongji.edu.cn/zsxw/ggtz.htm', 'yz.tongji.edu.cn/'],
        },
    ],
    name: '研究生招生网通知公告',
    maintainers: ['shengmaosu', 'sitdownkevin'],
    handler,
    url: 'yz.tongji.edu.cn/zsxw/ggtz.htm',
};

async function getNoticeContent(item) {
    const response = await got(item.link);
    const $ = load(response.data);
    const content = $('#vsb_content').html();
    item.description = content;
    return item;
}

async function handler() {
    const baseUrl = 'https://yz.tongji.edu.cn';
    const response = await got(`${baseUrl}/zsxw/ggtz.htm`);
    const $ = load(response.body);
    const container = $('#content-box > div.content > div.list_main_content > ul');
    const items = container
        .find('li')
        .toArray()
        .map((item) => {
            const title = $(item).find('a').attr('title');
            const linkRaw = $(item).find('a').attr('href');
            const link = linkRaw.startsWith('http') ? linkRaw : new URL(linkRaw, `${baseUrl}/zsxw`).toString();
            const pubDate = $(item).find('span').text();
            return { title, link, pubDate: parseDate(pubDate, 'YYYY-MM-DD') };
        });

    const itemsWithContent = await Promise.all(items.map((item) => cache.tryGet(item.link, () => getNoticeContent(item))));

    return {
        title: '同济大学研究生招生网',
        link: baseUrl,
        description: '同济大学研究生招生网通知公告',
        image: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        icon: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        logo: 'https://upload.wikimedia.org/wikipedia/zh/f/f8/Tongji_University_Emblem.svg',
        item: itemsWithContent,
    };
}
