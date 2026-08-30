import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { getTwitchHeaders, getUserId } from './utils';

export const route: Route = {
    path: '/clips/:channel',
    categories: ['live'],
    example: '/twitch/clips/xqc',
    parameters: {
        channel: 'Twitch channel login name (e.g. `xqc`)',
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
            source: ['twitch.tv/:channel/clips'],
            target: '/clips/:channel',
        },
    ],
    name: 'Channel Clips',
    maintainers: [],
    handler: async (ctx) => {
        const { channel } = ctx.req.param();

        const headers = await getTwitchHeaders();
        const user = await getUserId(channel);

        const params = new URLSearchParams({
            broadcaster_id: user.id,
            first: '20',
        });

        const data = await ofetch(`https://api.twitch.tv/helix/clips?${params}`, { headers });

        const items = (data.data ?? []).map((clip: any) => ({
            title: clip.title,
            link: clip.url,
            description: `
                <a href="${clip.url}">
                    <img src="${clip.thumbnail_url}" alt="${clip.title}" />
                </a>
                <p>Clipped by: ${clip.creator_name}</p>
                <p>Views: ${clip.view_count.toLocaleString()} | Duration: ${clip.duration}s</p>
            `,
            pubDate: parseDate(clip.created_at),
            author: clip.creator_name,
            category: ['clip'],
        }));

        return {
            title: `${user.display_name} — Twitch Clips`,
            link: `https://www.twitch.tv/${channel}/clips`,
            image: user.profile_image_url,
            item: items,
        };
    },
};
