import { load } from 'cheerio';

import type { Data, DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import parser from '@/utils/rss-parser';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/mikiki',
    name: '最新記事',
    maintainers: ['ashi-koki'],
    handler,
};

async function handler(): Promise<Data> {
    const rootUrl = 'https://mikiki.tokyo.jp';

    const feedResponse = await ofetch(`${rootUrl}/list/feed/rss`, { responseType: 'text' });
    const feed = await parser.parseString(feedResponse);

    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link!, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);

                $('.article-index, .ranking-in-article').remove();

                return {
                    title: item.title,
                    link: item.link,
                    pubDate: item.isoDate ? parseDate(item.isoDate) : undefined,
                    author: $('.article-header-author-name').first().text(),
                    description: $('.article-body').html(),
                };
            })
        )
    );

    return {
        title: feed.title!,
        link: rootUrl,
        description: feed.description,
        language: 'ja',
        item: items as DataItem[],
    };
}
