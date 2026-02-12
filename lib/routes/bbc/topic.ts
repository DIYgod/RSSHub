import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { extractSportContent, renderArticleContent } from './utils';

export const route: Route = {
    path: '/topics/:topic',
    name: 'Topics',
    maintainers: ['TonyRL'],
    handler,
    example: '/bbc/topics/c77jz3md4rwt',
    parameters: {
        topic: 'The topic ID to fetch news for, can be found in the URL.',
    },
    radar: [
        {
            source: ['www.bbc.com/news/topics/:topic'],
        },
    ],
    categories: ['traditional-media'],
};

async function handler(ctx) {
    const { topic } = ctx.req.param();
    const link = `https://www.bbc.com/news/topics/${topic}`;

    const response = await ofetch(link);
    const $ = load(response);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const pageProps = nextData.props.pageProps;
    const topicData = pageProps.page[pageProps.pageKey];

    const list = topicData.sections[0].content.map((item) => ({
        title: item.title,
        link: `https://www.bbc.com${item.href}`,
        description: item.description,
        pubDate: parseDate(item.metadata.firstUpdated),
        category: item.metadata.topics,
        image: item.image ? item.image.model.blocks.src : undefined,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);
                const $ = load(response);

                if (item.link.startsWith('https://www.bbc.com/sport/')) {
                    const { category, description } = extractSportContent($, item);
                    item.category = category;
                    item.description = description;
                } else {
                    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                    const pageProps = nextData.props.pageProps;
                    const articleData = pageProps.page[pageProps.pageKey];

                    item.category = [...new Set([...(item.category || []), ...articleData.topics.map((t) => t.title)])];
                    item.description = renderArticleContent(articleData.contents);
                }

                return item;
            })
        )
    );

    return {
        title: topicData.seo.title,
        description: topicData.seo.description,
        link,
        image: 'https://www.bbc.com/favicon.ico',
        item: items,
    };
}
