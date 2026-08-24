import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import { buildContent, extractThreadItems, parseRouteOptions, threadUrl } from './utils';

export const route: Route = {
    path: '/search/:keyword/:routeParams?',
    categories: ['social-media'],
    view: ViewType.SocialMedia,
    example: '/threads/search/RSS',
    parameters: {
        keyword: 'Search keyword',
        routeParams: {
            description: `Extra parameters, in the format of query string. Accepts the same options as User timeline, plus:

| Key         | Description | Accepts                    | Defaults to |
| ----------- | ----------- | -------------------------- | ----------- |
| \`serpType\` | Search type | \`tags\`/\`default\`/\`recent\` | \`tags\`      |`,
        },
    },
    name: 'Search',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const { keyword, routeParams } = ctx.req.param();
    const params = new URLSearchParams(routeParams);
    const options = parseRouteOptions(params);
    const serpType = params.get('serpType') ?? 'tags';

    const link = `https://www.threads.com/search?q=${encodeURIComponent(keyword)}&serp_type=${serpType}`;
    const response = await ofetch(link);
    const $ = load(response);

    const threadsData = extractThreadItems($);

    if (!threadsData.length) {
        throw new Error('Failed to fetch thread data');
    }

    ctx.set('json', threadsData);

    const items = threadsData.map((item) => {
        const { title, description } = buildContent(item, options);
        return {
            author: item.post.user?.username,
            title,
            description,
            pubDate: parseDate(item.post.taken_at, 'X'),
            link: threadUrl(item.post.code),
        };
    });

    return {
        title: `${keyword} - Search on Threads`,
        link,
        item: items,
    };
}
