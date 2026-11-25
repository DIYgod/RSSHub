import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

interface RoomDossier {
    broadcaster_username: string;
    room_status: string;
    start_timestamp: number;
    num_viewers: number;
}

export const route: Route = {
    path: '/live/:username',
    name: 'Live status',
    categories: ['live'],
    example: '/chaturbate/live/nakedbakers',
    parameters: {
        username: 'The broadcaster username from the room URL.',
    },
    features: {
        nsfw: true,
        antiCrawler: true,
    },
    maintainers: ['DIYgod'],
    radar: [
        {
            source: ['chaturbate.com/:username'],
        },
    ],
    description:
        'Reports public live streams using the actual broadcast start time as the entry ID and publication date. When the room is offline or not public, it returns a status entry with a fixed ID and no publication date, so polling does not create new notifications. Only stream status and viewer counts are included.',
    handler,
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const link = `https://chaturbate.com/${username}/`;
    const dossier: RoomDossier = await ofetch(`https://chaturbate.com/api/chatvideocontext/${username}/`);
    const broadcaster = dossier.broadcaster_username;
    const isLive = dossier.room_status === 'public';
    const startTime = dossier.start_timestamp;

    return {
        title: `${broadcaster} - Live status`,
        link,
        item: [
            {
                title: isLive ? `${broadcaster} is live` : `${broadcaster}: ${dossier.room_status}`,
                link,
                author: broadcaster,
                guid: isLive ? `${broadcaster}:${startTime}` : `${broadcaster}:inactive`,
                pubDate: isLive ? parseDate(startTime, 'X') : undefined,
                description: `<p>Viewers: ${dossier.num_viewers}</p>`,
            },
        ],
    };
}
