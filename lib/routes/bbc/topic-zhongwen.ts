import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { renderArticleContent } from './utils';

export const route: Route = {
    path: '/zhongwen/topics/:topic/:variant?',
    name: 'Topics - BBC News 中文',
    maintainers: ['TonyRL'],
    handler,
    example: '/bbc/zhongwen/topics/c77jz3md4rwt',
    parameters: {
        topic: 'The topic ID to fetch news for, can be found in the URL.',
        variant: {
            description: 'The language variant.',
            default: 'trad',
            options: [
                { label: '简', value: 'simp' },
                { label: '繁', value: 'trad' },
            ],
        },
    },
    radar: [
        {
            source: ['www.bbc.com/zhongwen/topics/:topic/:variant'],
        },
    ],
    categories: ['traditional-media'],
};

async function handler(ctx) {
    const { topic, variant = 'trad' } = ctx.req.param();
    const link = `https://www.bbc.com/zhongwen/topics/${topic}/${variant}`;

    const response = await ofetch(link);
    const $ = load(response);

    const nextData = JSON.parse($('script#__NEXT_DATA__').text());
    const pageData = nextData.props.pageProps.pageData;

    const list = pageData.curations[0].summaries.map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: parseDate(item.firstPublished),
        image: item.imageUrl ? item.imageUrl.replace('/{width}/', '/1536/') : undefined,
    }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const response = await ofetch(item.link);

                const $ = load(response);
                const nextData = JSON.parse($('script#__NEXT_DATA__').text());
                const pageData = nextData.props.pageProps.pageData;
                const metadata = pageData.metadata;

                item.category = [...new Set([...metadata.tags.about.map((t) => t.thingLabel), ...metadata.topics.map((t) => t.topicName)])];

                item.description = renderArticleContent(pageData.content.model.blocks);

                return item;
            })
        )
    );

    return {
        title: `${pageData.title} - BBC News 中文`,
        description: pageData.description,
        link,
        image: 'https://www.bbc.com/favicon.ico',
        item: items,
    };
}
