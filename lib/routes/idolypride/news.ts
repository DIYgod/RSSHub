import Parser from 'rss-parser';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const parser = new Parser<object, { updated?: string }>({
    customFields: {
        item: ['updated'],
    },
});

export const route: Route = {
    path: '/news',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/idolypride/news',
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
            source: ['idolypride.jp/news'],
        },
    ],
    name: 'News',
    maintainers: ['Mingxia1'],
    handler,
    url: 'idolypride.jp/news',
};

async function handler() {
    const response = await got('https://idolypride.jp/?feed=atom&post_type=news');
    const feed = await parser.parseString(response.data);

    return {
        title: '偶像荣耀-新闻',
        link: 'https://idolypride.jp/news',
        item: feed.items.map((item) => ({
            title: item.title!,
            link: item.link,
            pubDate: item.pubDate ? parseDate(item.pubDate) : undefined,
            updated: item.updated ? parseDate(item.updated) : undefined,
            description: item.content,
        })),
    };
}
