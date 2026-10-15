import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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

async function getNoticeContent(link: string) {
    const response = await got(link);
    const $ = load(response.data);
    const content = $('#vsb_content').html();
    return { description: content };
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
            const title = $(item).find('a').attr('title')!;
            const linkRaw = $(item).find('a').attr('href');
            const link = linkRaw!.startsWith('http') ? linkRaw : new URL(linkRaw!, `${baseUrl}/zsxw`).href;
            const pubDate = $(item).find('span').text();
            return { title, link, pubDate: timezone(parseDate(pubDate, 'YYYY-MM-DD'), 8) };
        });

    const itemsWithContent = await pMap(items, async (item) => ({ ...item, ...(await cache.tryGet(`tongji:yjs:article:${item.link}`, () => getNoticeContent(item.link!))) }), { concurrency: 3 });

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
