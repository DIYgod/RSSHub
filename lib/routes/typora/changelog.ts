import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/typora/changelog',
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
            source: ['support.typora.io/'],
        },
    ],
    name: 'Changelog',
    maintainers: ['cnzgray'],
    handler,
    url: 'support.typora.io/',
};

async function getArticleItem(item: DataItem & { link: string }): Promise<DataItem> {
    const details = await cache.tryGet<Pick<DataItem, 'pubDate' | 'description'>>(`typora:changelog:${item.link}`, async () => {
        const { data } = await got(item.link);
        const $ = load(data);
        const publication = $('#header .post-meta > div').filter((_, element) => $(element).children('div').first().text() === 'Published');
        return {
            pubDate: parseDate(publication.find('time').text(), 'MMMM D, YYYY', 0),
            description: $('#post-content').html(),
        };
    });
    return { ...item, pubDate: details.pubDate, description: details.description };
}

async function handler() {
    const host = 'https://support.typora.io';

    const { data } = await got(`${host}/store/`);

    const list = Object.values<{ category: string; title: string; author: string; content: DataItem['description']; url: string }>(data)
        .filter((i) => i.category === 'new')
        .map((i): DataItem & { link: string } => ({
            title: i.title,
            author: i.author,
            description: i.content,
            link: `${host}${i.url}`,
        }));

    const items = await pMap(list, getArticleItem, { concurrency: 3 });

    return {
        title: 'Typora Changelog',
        link: host,
        description: 'Typora Changelog',
        image: `${host}/assets/img/favicon-128.png`,
        item: items,
    };
}
