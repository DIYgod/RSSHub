import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildGraphqlBody, getMetaServerContext, GRAPHQL_ENDPOINT, metaGraphqlHeaders } from './utils';

export const route: Route = {
    path: '/ai/blog',
    categories: ['programming'],
    example: '/meta/ai/blog',
    name: 'AI Blog',
    maintainers: ['TonyRL'],
    url: 'ai.meta.com/blog/',
    radar: [
        {
            source: ['ai.meta.com/blog/', 'ai.meta.com'],
        },
    ],
    handler,
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit') || 12, 10);
    const link = 'https://ai.meta.com/blog/';

    const { $, server } = await getMetaServerContext(link);
    const friendlyName = 'MetaAIBlogRecentPostSearchQuery';

    const data = await ofetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: metaGraphqlHeaders(server, friendlyName),
        body: buildGraphqlBody({
            server,
            friendlyName,
            docId: '9516719638450392',
            variables: { input: { query: '', from: 0, limit, tags: [], excludeObjectIDs: ['27568536916124137'] } },
        }),
        parseResponse: JSON.parse,
    });

    const items = data.data.query.map((item) => ({
        title: item.title,
        description: item.description,
        link: item.href,
        pubDate: parseDate(item.date),
        category: [item.research_area],
        image: item.image,
    }));

    return {
        title: $('#pageTitle').text(),
        description: $('meta[name="description"]').attr('content'),
        image: $('link[rel="icon"]').attr('href'),
        link,
        item: items,
    };
}
