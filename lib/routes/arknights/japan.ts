import { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/japan',
    categories: ['game'],
    example: '/arknights/japan',
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
            source: ['ak.arknights.jp/news', 'ak.arknights.jp/'],
        },
    ],
    name: 'アークナイツ (日服新闻)',
    maintainers: ['ofyark'],
    handler,
    url: 'ak.arknights.jp/news',
};

async function handler() {
    const response = await got({
        method: 'get',
        url: 'https://www.arknights.jp:10014/news?lang=ja&limit=9&page=1',
    });

    const items = response.data.data.items;
    const newsList = items.map((item) => ({
        title: item.title,
        description: item.content[0].value,
        pubDate: parseDate(item.publishedAt),
        link: `https://www.arknights.jp/news/${item.id}`,
    }));

    return {
        title: 'アークナイツ',
        link: 'https://www.arknights.jp/news',
        description: 'アークナイツ ニュース',
        language: 'ja',
        item: newsList,
    };
}
