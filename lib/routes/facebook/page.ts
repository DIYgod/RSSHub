import type { Context } from 'hono';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { baseUrl, fetchStories, storiesToItems } from './utils';

export const route: Route = {
    path: '/page/:id',
    categories: ['social-media'],
    example: '/facebook/page/NASA',
    parameters: { id: 'Page or profile username, or numeric ID' },
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
            source: ['www.facebook.com/:id', 'www.facebook.com/people/:name/:id'],
            target: '/page/:id',
        },
    ],
    name: 'Page / Profile',
    maintainers: ['TonyRL'],
    description: 'Works for pages and public personal profiles. Posts behind a login wall require `FACEBOOK_COOKIE`.',
    handler,
    url: 'www.facebook.com',
};

async function handler(ctx: Context) {
    const { id } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 21;
    const pageId = /^\d+$/.test(id)
        ? id
        : ((await cache.tryGet(`facebook:page:${id}`, async () => {
              const html = await ofetch(`${baseUrl}/plugins/page.php`, { query: { href: `${baseUrl}/${id}/` } });
              const pageId = html.match(/initializeClickLoggers",\[[^\]]*\],\[false,"(\d+)"/)?.[1] ?? html.match(/"pageID":"(\d+)"/)?.[1];
              if (!pageId) {
                  throw new Error(`Facebook page ${id} not found`);
              }
              return pageId;
          })) as string);

    const stories = await fetchStories(
        'ProfileCometTimelineFeedRefetchQuery',
        '28844200915213260',
        {
            id: pageId,
            feedLocation: 'TIMELINE',
            feedbackSource: 0,
            omitPinnedPost: true,
            privacySelectorRenderLocation: 'COMET_STREAM',
            renderLocation: 'timeline',
            run_with_continuation_key: false,
            stream_count: 1,
        },
        limit
    );

    const actor = stories[0].comet_sections.content.story.actors[0];

    return {
        title: actor.name,
        link: actor.url,
        image: actor.profile_picture.uri,
        item: storiesToItems(stories),
    };
}
