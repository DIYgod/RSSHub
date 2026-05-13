import type { Route, DataItem } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { getArticleDetail } from './utils';

export const route: Route = {
    path: '/rss',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/foreignaffairs/rss',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'RSS',
    maintainers: ['dzx-dzx'],
    handler,
};

async function handler() {
    const link = 'https://www.foreignaffairs.com/rss.xml';

    const feed = await parser.parseURL(link);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const detail = await getArticleDetail(item.link!);
                return {
                    title: item.title!,
                    link: item.link,
                    pubDate: item.pubDate,
                    guid: item.guid || item.link,
                    author: detail.author || item.creator || '',
                    category: detail.category,
                    description: detail.description,
                    image: item.enclosure?.url,
                } satisfies DataItem;
            })
        )
    );

    return {
        title: 'Foreign Affairs',
        link,
        description: feed.description || 'Foreign Affairs RSS Feed',
        language: feed.language || 'en',
        item: items as DataItem[],
    };
}
