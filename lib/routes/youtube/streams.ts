import type { Route } from '@/types';
import { ViewType } from '@/types';
import { fallback, queryToBoolean } from '@/utils/readable-social';

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

| Name               | Description                                                                                 | Default |
| ------------------ | ------------------------------------------------------------------------------------------- | ------- |
| embed              | Whether to embed the video, fill in any value to disable embedding                          | embed   |
| includeLive        | Whether to include ongoing live streams, fill in any falsy value to exclude them            | true    |
| includeUpcoming    | Whether to include scheduled live streams, fill in any falsy value to exclude them          | true    |
| includeCompleted   | Whether to include finished live streams, fill in any falsy value to exclude them           | true    |
| includeDescription | Whether to include the description of each stream, fill in any truthy value to include them | false   |

:::

::: tip
Unlike [Live](#youtube-live), this route reads the channel's Live tab, so it also covers scheduled and finished streams, and it does not require an API key.

For example, \`/youtube/streams/@GawrGura/includeCompleted=false\` only tracks streams that are live or about to start.

The Live tab does not carry the stream descriptions, so \`includeDescription\` costs one extra request per stream and is off by default.
:::`,
};

async function handler(ctx) {
    const handle = ctx.req.param('handle');
    const params = new URLSearchParams(ctx.req.param('routeParams'));
    const isEnabled = (name: string, byDefault: boolean): boolean => fallback(undefined, queryToBoolean(params.get(name)), byDefault);

    const channelId = isYouTubeChannelId(handle) ? handle : await getChannelIdByUsername(handle);

    return await getStreamsByChannelId({
        channelId,
        embed: !params.get('embed'),
        includeLive: isEnabled('includeLive', true),
        includeUpcoming: isEnabled('includeUpcoming', true),
        includeCompleted: isEnabled('includeCompleted', true),
        includeDescription: isEnabled('includeDescription', false),
    });
}
