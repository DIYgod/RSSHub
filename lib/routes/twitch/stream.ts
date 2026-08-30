import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { getTwitchHeaders, getUserId } from './utils';

export const route: Route = {
    path: '/stream/:channel',
    categories: ['live'],
    example: '/twitch/stream/pokimane',
    parameters: {
        channel: 'Twitch channel login name (e.g. `pokimane`)',
    },
    features: {
        requireConfig: [
            { name: 'TWITCH_CLIENT_ID', description: 'Twitch app Client ID' },
            { name: 'TWITCH_CLIENT_SECRET', description: 'Twitch app Client Secret' },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['twitch.tv/:channel'],
            target: '/stream/:channel',
        },
    ],
    name: 'Live Stream Status',
    maintainers: [],
    handler: async (ctx) => {
        const { channel } = ctx.req.param();

        const headers = await getTwitchHeaders();
        const user = await getUserId(channel);

        const data = await ofetch(
            `https://api.twitch.tv/helix/streams?user_login=${encodeURIComponent(channel)}`,
            { headers }
        );

        const stream = data.data?.[0];
        const isLive = !!stream;

        const items = isLive
            ? [
                  {
                      title: `🔴 LIVE: ${stream.title}`,
                      link: `https://www.twitch.tv/${channel}`,
                      description: `
                        <a href="https://www.twitch.tv/${channel}">
                            <img src="${stream.thumbnail_url.replace('{width}', '640').replace('{height}', '360')}" alt="${stream.title}" />
                        </a>
                        <p>Game: ${stream.game_name}</p>
                        <p>Viewers: ${stream.viewer_count.toLocaleString()}</p>
                    `,
                      pubDate: parseDate(stream.started_at),
                      author: user.display_name,
                      category: [stream.game_name, 'live'],
                  },
              ]
            : [
                  {
                      title: `${user.display_name} is offline`,
                      link: `https://www.twitch.tv/${channel}`,
                      description: `<p>${user.display_name} is not currently streaming.</p>`,
                      pubDate: new Date(),
                      author: user.display_name,
                  },
              ];

        return {
            title: `${user.display_name} — Twitch Stream`,
            link: `https://www.twitch.tv/${channel}`,
            image: user.profile_image_url,
            item: items,
        };
    },
};
