import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const renderImage = (src, alt) => renderToString(<img src={src} alt={alt} />);

export const route: Route = {
    path: '/',
    categories: ['anime'],
    example: '/bangumi.online',
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
    name: '當季新番',
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
        description: renderImage(`https:${item.cover}`, `${item.title_zh} - 第 ${item.volume} 集`),
        link: `https://bangumi.online/watch/${item.vid}`,
        pubDate: parseDate(item.create_time),
    }));

    return {
        title: 'アニメ新番組',
        link: 'https://bangumi.online',
        item: items,
    };
}
