import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/markets',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/schwabnetwork/markets',
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
            source: ['schwabnetwork.com/markets'],
        },
    ],
    name: '市场新闻',
    maintainers: ['hutianyu2006'],
    handler,
    url: 'schwabnetwork.com/markets',
};

async function handler() {
    const url = 'https://www.schwabnetwork.com/markets';
    const response = await got(url);
    const $ = load(response.body);

    const nextDataRaw = $('#__NEXT_DATA__').text();
    const nextData = JSON.parse(nextDataRaw || '{}');

    const items = Object.values(nextData.props.pageProps.context.META_CATEGORY_ARTICLES.value).flatMap((articles: any) =>
        articles.map((article: any) =>
            cache.tryGet(`schwabnetwork:markets:${article.id}`, async () => {
                const articleResponse = await got(`https://www.schwabnetwork.com${article.href}`);
                const article$ = load(articleResponse.body);
                const nextDataRaw = article$('#__NEXT_DATA__').text();
                const nextData = JSON.parse(nextDataRaw || '{}');
                const articleContentBlocks = nextData.props.pageProps.context.articleContent.value.content.blocks ?? [];
                const articleContent = articleContentBlocks
                    .map((block: any) => {
                        if (block.type === 'text') {
                            return block.content;
                        }
                        // Note: Hard to handle M3U8 playlists, so text only for now.
                        return '';
                    })
                    .join('');

                return {
                    title: article.name,
                    link: `https://www.schwabnetwork.com${article.href}`,
                    description: articleContent,
                    guid: article.id,
                    pubDate: parseDate(article.date),
                };
            })
        )
    );

    const resolvedItems = await Promise.all(items);
    const uniqueItems = new Map(resolvedItems.map((item) => [item.guid, item])).values().toArray();

    const result = {
        title: 'Schwab Network - Markets Overview',
        description: 'Latest news and updates from Schwab Network.',
        link: url,
        item: uniqueItems,
    };
    return result;
}
