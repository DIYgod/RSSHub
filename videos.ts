import { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import { getTwitchHeaders, getUserId } from './utils';

export const route: Route = {
    path: '/videos/:channel/:type?',
    categories: ['live'],
    example: '/twitch/videos/shroud',
    parameters: {
        channel: 'Twitch channel login name (e.g. `shroud`)',
        type: 'Video type: `archive` (past broadcasts), `highlight`, or `upload`. Default: `archive`',
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
            source: ['twitch.tv/:channel/videos'],
            target: '/videos/:channel',
        },
    ],
    name: 'Channel Videos',
    maintainers: [],
    handler: async (ctx) => {
        const { channel, type = 'archive' } = ctx.req.param();
        const validTypes = ['archive', 'highlight', 'upload', 'all'];
        const videoType = validTypes.includes(type) ? type : 'archive';

        const headers = await getTwitchHeaders();
        const user = await getUserId(channel);

        const params = new URLSearchParams({
            user_id: user.id,
            first: '20',
            sort: 'time',
        });

        if (videoType !== 'all') {
            params.set('type', videoType);
        }

        const data = await ofetch(`https://api.twitch.tv/helix/videos?${params}`, { headers });

        const items = (data.data ?? []).map((video: any) => ({
            title: video.title,
            link: `https://www.twitch.tv/videos/${video.id}`,
            description: `
                <a href="https://www.twitch.tv/videos/${video.id}">
                    <img src="${video.thumbnail_url.replace('%{width}', '640').replace('%{height}', '360')}" alt="${video.title}" />
                </a>
                <p>${video.description || ''}</p>
                <p>Duration: ${video.duration} | Views: ${video.view_count.toLocaleString()}</p>
            `,
            pubDate: parseDate(video.created_at),
            author: user.display_name,
            category: [video.type],
        }));

        return {
            title: `${user.display_name} — Twitch ${videoType === 'archive' ? 'Past Broadcasts' : videoType === 'highlight' ? 'Highlights' : 'Videos'}`,
            link: `https://www.twitch.tv/${channel}/videos`,
            image: user.profile_image_url,
            item: items,
        };
    },
};
