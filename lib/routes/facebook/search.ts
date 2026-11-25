import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import { getRouteLimit } from '@/utils/route-limit';

import { baseUrl, fetchStories, storiesToItems } from './utils';

export const route: Route = {
    path: '/search/:keyword',
    categories: ['social-media'],
    example: '/facebook/search/rsshub',
    parameters: { keyword: 'Search keyword' },
    features: {
        requireConfig: [
            {
                name: 'FACEBOOK_COOKIE',
                description: 'Facebook cookie, only `c_user` and `xs` are required.',
            },
        ],
        antiCrawler: true,
    },
    name: 'Search',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.facebook.com',
};

async function handler(ctx: Context) {
    if (!config.facebook.cookie) {
        throw new ConfigNotFoundError('Facebook search RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const { keyword } = ctx.req.param();

    const stories = await fetchStories(
        'SearchCometResultsInitialResultsQuery',
        '29282619334732828',
        {
            __relay_internal__pv__SearchCometRelatedSearchThumbnailDesignrelayprovider: true,
            __relay_internal__pv__CometUFICommentActionLinkStableIDsrelayprovider: false,
            __relay_internal__pv__GeminiUFISaveToKnowledgeHubGKrelayprovider: false,
            allow_streaming: false,
            args: {
                callsite: 'COMET_GLOBAL_SEARCH',
                config: { exact_match: false },
                experience: { type: 'POSTS_TAB' },
                filters: ['{"name":"recent_posts","args":""}'],
                text: keyword,
            },
            feedbackSource: 23,
            fetch_filters: true,
            renderLocation: 'search_results_page',
            stream_initial_count: 0,
        },
        getRouteLimit(ctx, 15)
    );

    return {
        title: `${keyword} - Facebook Search`,
        link: `${baseUrl}/search/posts/?q=${encodeURIComponent(keyword)}`,
        item: storiesToItems(stories),
    };
}
