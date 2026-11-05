import { load } from 'cheerio';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/hospital',
    categories: ['university'],
    example: '/nju/hospital',
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
            source: ['hospital.nju.edu.cn/xwgg/ggtz/index.html'],
        },
    ],
    name: '校医院',
    maintainers: ['ret-1'],
    handler,
    url: 'hospital.nju.edu.cn/xwgg/ggtz/index.html',
};

interface HospitalNotice {
    title: string;
    summary?: string;
    url: string;
    username?: string;
    releasetime?: number;
}

const url = 'https://hospital.nju.edu.cn/xwgg/ggtz/index.html';

async function handler() {
    const response = await got(url);
    const $ = load(response.data);
    const script = $('script')
        .toArray()
        .map((element) => $(element).text())
        .find((source) => /\bvar\s+dataList\s*=/.test(source));
    const serialized = script?.match(/\bdataList\s*=\s*(\[.*?\]);/s)?.[1];
    if (!serialized) {
        throw new Error('The hospital announcement page does not contain its notice data.');
    }
    const pages: Array<{ infolist: HospitalNotice[] }> = JSON.parse(serialized);
    const items = pages[0].infolist.map((item) => ({
        title: item.title,
        description: item.summary,
        link: new URL(item.url, url).href,
        author: item.username,
        pubDate: item.releasetime === undefined ? undefined : parseDate(item.releasetime, 'x'),
    }));

    return {
        title: '校医院-公告通知',
        link: url,
        item: items,
    };
}
