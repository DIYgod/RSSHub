import type { Route } from '@/types';
import { ViewType } from '@/types';

import { getChannelIdByUsername, getStreamsByChannelId } from './api/youtubei';
import { isYouTubeChannelId } from './utils';

export const route: Route = {
    path: '/streams/:handle/:routeParams?',
    categories: ['live'],
    view: ViewType.Videos,
    example: '/youtube/streams/@GawrGura',
    parameters: {
        handle: 'YouTube handle or channel id',
        routeParams: 'Extra parameters, see the table below',
    },
    radar: [
        {
            source: ['www.youtube.com/@:handle/streams'],
            target: '/streams/@:handle',
        },
        {
            source: ['www.youtube.com/channel/:handle/streams'],
            target: '/streams/:handle',
        },
    ],
    name: 'Live Streams',
    maintainers: ['ouuan'],
    handler,
    description: `::: tip Parameter

| Name             | Description                                                                        | Default |
| ---------------- | ---------------------------------------------------------------------------------- | ------- |
| embed            | Whether to embed the video, fill in any value to disable embedding                 | embed   |
| includeLive      | Whether to include ongoing live streams, fill in any falsy value to exclude them   | true    |
| includeUpcoming  | Whether to include scheduled live streams, fill in any falsy value to exclude them | true    |
| includeCompleted | Whether to include finished live streams, fill in any falsy value to exclude them  | true    |

:::

::: tip
Unlike [Live](#youtube-live), this route reads the channel's Live tab, so it also covers scheduled and finished streams, and it does not require an API key.

For example, \`/youtube/streams/@GawrGura/includeCompleted=false\` only tracks streams that are live or about to start.
:::`,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');
    const params = new URLSearchParams(ctx.req.param('routeParams'));
    const isIncluded = (name: string) => [null, '', 'true'].includes(params.get(name));

    const channelId = isYouTubeChannelId(handle) ? handle : await getChannelIdByUsername(handle);

    return await getStreamsByChannelId({
        channelId,
        embed: !params.get('embed'),
        includeLive: isIncluded('includeLive'),
        includeUpcoming: isIncluded('includeUpcoming'),
        includeCompleted: isIncluded('includeCompleted'),
    });
}
