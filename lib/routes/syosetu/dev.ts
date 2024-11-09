import { Data, Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';

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
    const url = 'https://dev.syosetu.com/';

    return (await cache.tryGet(url, async () => {
        const data = await ofetch(url);
        const $ = load(data);

        const logContainer = $('.c-log');

        const dates = logContainer
            .find('dt')
            .map((_, element) => $(element).text().trim())
            .toArray();

        const contents = logContainer
            .find('dd')
            .map((_, element) => $(element).text().trim())
            .toArray();

        const updates = dates
            .map((date, index) => ({
                date,
                content: contents[index]?.replace(/\n/g, '<br>') ?? '',
            }))
            .filter((update) => update.content);

        const response = {
            title: 'なろうデベロッパー - なろう小説 API の更新履歴',
            link: url,
            language: 'ja',
            item: updates.map((update) => ({
                title: update.date,
                description: update.content,
                pubDate: parseDate(update.date.replace('/', '-')),
            })),
        };

        return response;
    })) as Data;
}
