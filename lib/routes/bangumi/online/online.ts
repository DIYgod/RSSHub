import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import * as path from 'node:path';

export const route: Route = {
    path: '/online',
    categories: ['anime'],
    example: '/bangumi/online',
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
            source: ['bangumi.online/'],
        },
    ],
    name: 'Unknown',
    maintainers: ['devinmugen'],
    handler,
    url: 'bangumi.online/',
};

async function handler() {
    const url = 'https://api.bangumi.online/serve/home';

    const response = await got.post(url);

    const list = response.data.data.list;

    const items = list.map((item) => ({
        title: `${item.title.zh ?? item.title.ja} - 第 ${item.volume} 集`,
        description: art(path.join(__dirname, '../templates/online/image.art'), {
            src: `https:${item.cover}`,
            alt: `${item.title_zh} - 第 ${item.volume} 集`,
        }),
        link: `https://bangumi.online/watch/${item.vid}`,
        pubDate: parseDate(item.create_time),
    }));

    return {
        title: 'アニメ新番組',
        link: 'https://bangumi.online',
        item: items,
    };
}
