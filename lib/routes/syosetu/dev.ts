import { load } from 'cheerio';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/dev',
    categories: ['program-update'],
    example: '/syosetu/dev',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'なろう小説 API の更新履歴',
    url: 'dev.syosetu.com',
    maintainers: ['SnowAgar25'],
    handler,
    radar: [
        {
            title: 'なろう小説 API の更新履歴',
            source: ['dev.syosetu.com'],
            target: '/dev',
        },
    ],
};

async function handler(): Promise<Data> {
    const url = 'https://dev.syosetu.com';

    const data = await ofetch(url);
    const $ = load(data);

    const logContainer = $('.c-log');

    const dates = logContainer
        .find('dt')
        .toArray()
        .map((element) => $(element).text().trim());

    const contents = logContainer
        .find('dd')
        .toArray()
        .map((element) => $(element).text().trim());

    const updates = dates
        .map((date, index) => ({
            date,
            content: contents[index]?.replaceAll('\n', '<br>') ?? '',
        }))
        .filter((update) => update.content);

    return {
        title: 'なろうデベロッパー - なろう小説 API の更新履歴',
        link: url,
        language: 'ja',
        item: updates.map((update) => ({
            title: update.date,
            description: update.content,
            pubDate: parseDate(update.date.replace('/', '-')),
            guid: `syosetu:dev:${update.date}`,
        })),
    };
}
