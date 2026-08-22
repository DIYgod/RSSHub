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

    const nextDataRaw = $('#__NEXT_DATA__').html();
    const nextData = JSON.parse(nextDataRaw || '{}');

    const articles = Object.values(nextData.props.pageProps.context.META_CATEGORY_ARTICLES.value).flat();

    const items = articles.map((article: any) =>
        cache.tryGet(`schwabnetwork:markets:${article.id}`, async () => {
            const articleResponse = await got(`https://www.schwabnetwork.com${article.href}`);
            const article$ = load(articleResponse.body);
            const nextDataRaw = article$('#__NEXT_DATA__').html();
            const nextData = JSON.parse(nextDataRaw || '{}');
            const articleContent = nextData.props.pageProps.context.articleContent.value.content.blocks[0].content ?? '';

            return {
                title: article.name,
                link: `https://www.schwabnetwork.com${article.href}`,
                description: articleContent,
                guid: article.id,
                pubDate: parseDate(article.date),
            };
        })
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
