import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { parseArticle } from './utils';

export const route: Route = {
    path: '/article',
    categories: ['traditional-media'],
    example: '/caixin/article',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: true,
        supportScihub: false,
    },
    radar: [
        {
            source: ['caixin.com/'],
        },
    ],
    name: '首页新闻',
    maintainers: ['EsuRt'],
    handler,
    url: 'caixin.com/',
};

async function handler() {
    const { data: response } = await got('https://mapiv5.caixin.com/m/api/getWapIndexListByPage');

    const list = response.data.list.map((item) => ({
        title: item.title,
        description: item.summary,
        author: item.author_name,
        pubDate: parseDate(item.time, 'X'),
        link: item.web_url,
        pics: item.pics,
        audio: item.cms_audio_url,
        audio_image_url: item.audio_image_url,
    }));

    const items = await Promise.all(list.map((item) => cache.tryGet(item.link, () => parseArticle(item))));

    return {
        title: '财新网 - 首页',
        link: 'https://www.caixin.com',
        description: '财新网 - 首页',
        item: items,
    };
}
