import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, fetchStories, storiesToItems } from './utils';

export const route: Route = {
    path: '/group/:id',
    categories: ['social-media'],
    example: '/facebook/group/nodejs',
    parameters: { id: 'Group ID or group username' },
    features: {
        requireConfig: [
            {
                name: 'FACEBOOK_COOKIE',
                optional: true,
                description: 'Facebook cookie, only `c_user` and `xs` are required. Set this if you see `Rate limit exceeded`.',
            },
        ],
        antiCrawler: true,
    },
    radar: [
        {
            source: ['www.facebook.com/groups/:id'],
        },
    ],
    name: 'Group',
    maintainers: ['TonyRL'],
    handler,
    url: 'www.facebook.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 21;

    const groupId = /^\d+$/.test(id)
        ? id
        : ((await cache.tryGet(`facebook:group:${id}`, async () => {
              const html = await ofetch(`${baseUrl}/groups/${id}/about`, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' } });
              const groupId = html.match(/"groupID":"(\d+)"/)?.[1];
              if (!groupId) {
                  throw new Error(`Facebook group ${id} not found`);
              }
              return groupId;
          })) as string);

    const stories = await fetchStories(
        'GroupsCometFeedRegularStoriesPaginationQuery',
        '28691921240463205',
        {
            id: groupId,
            feedLocation: 'GROUP',
            feedType: 'DISCUSSION',
            feedbackSource: 0,
            privacySelectorRenderLocation: 'COMET_STREAM',
            renderLocation: 'group',
            sortingSetting: 'CHRONOLOGICAL',
            stream_initial_count: 1,
            youthIntegrityHostID: groupId,
        },
        limit
    );
    const group = stories[0].to;

    return {
        title: group.name,
        link: group.url,
        item: storiesToItems(stories),
    };
}
