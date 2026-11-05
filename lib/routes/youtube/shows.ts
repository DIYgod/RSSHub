import type { Route } from '@/types';

import { getChannelIdByUsername, getShowsByChannelId } from './api/youtubei';
import { isYouTubeChannelId } from './utils';

export const route: Route = {
    path: '/shows/:username',
    categories: ['social-media'],
    example: '/youtube/shows/@LinusTechTips',
    parameters: {
        username: 'YouTube handle or channel id',
    },
    radar: [
        {
            source: ['www.youtube.com/:username/shows', 'www.youtube.com/channel/:username/shows'],
            target: '/shows/:username',
        },
    ],
    name: 'Shows',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const channelId = isYouTubeChannelId(username) ? username : await getChannelIdByUsername(username);

    return await getShowsByChannelId(channelId);
}
