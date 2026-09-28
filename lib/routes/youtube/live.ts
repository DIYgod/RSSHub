import type { Route } from '@/types';
import { ViewType } from '@/types';

import { getChannelIdByUsername, getStreamsByChannelId } from './api/youtubei';
import { isYouTubeChannelId } from './utils';

export const route: Route = {
    path: '/live/:username/:embed?',
    categories: ['live'],
    view: ViewType.Videos,
    example: '/youtube/live/@GawrGura',
    parameters: {
        username: 'YouTube handle or channel id',
        embed: 'Default to embed the video, set to any value to disable embedding',
    },
    radar: [
        {
            source: ['www.youtube.com/@:username/streams'],
            target: '/live/@:username',
        },
        {
            source: ['www.youtube.com/channel/:username/streams'],
            target: '/live/:username',
        },
    ],
    name: 'Live',
    maintainers: ['sussurr127', 'ouuan'],
    handler,
    description: `::: tip
Every stream is categorized as \`live\`, \`upcoming\` or \`completed\`, so a single state can be picked out with the \`filter_category\` and \`filterout_category\` [common parameters](https://docs.rsshub.app/guide/parameters#filtering). For example, \`/youtube/live/@GawrGura?filterout_category=completed\` only tracks streams that are live or about to start.
:::`,
};

async function handler(ctx) {
    const username = ctx.req.param('username');
    const channelId = isYouTubeChannelId(username) ? username : await getChannelIdByUsername(username);

    return await getStreamsByChannelId({
        channelId,
        embed: !ctx.req.param('embed'),
    });
}
