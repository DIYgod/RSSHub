import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

interface RoomDossier {
    broadcaster_username: string;
    room_status: string;
    start_timestamp?: number;
    num_viewers?: number;
}

const dossierPattern = /window\.initialRoomDossier\s*=\s*("(?:[^"\\]|\\.)*")\s*;/;

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
    const username = ctx.req.param('username') ?? '';
    if (!/^\w+$/.test(username)) {
        throw new InvalidParameterError('Use the broadcaster username from https://chaturbate.com/username/.');
    }
    //
    const link = `https://chaturbate.com/${username}/`;
    const response = await ofetch(link, { responseType: 'text' });
    const match = response.match(dossierPattern);
    if (!match) {
        throw new Error('Chaturbate did not provide public room metadata. Check the username and whether the room is accessible from this instance.');
    }

    const dossier = JSON.parse(JSON.parse(match[1])) as RoomDossier;
    if (typeof dossier.broadcaster_username !== 'string' || dossier.broadcaster_username.toLowerCase() !== username.toLowerCase() || typeof dossier.room_status !== 'string') {
        throw new Error('Chaturbate returned unexpected room metadata. Check the broadcaster username.');
    }

    const broadcaster = dossier.broadcaster_username;
    const isLive = dossier.room_status === 'public';
    const startTime = dossier.start_timestamp;
    if (isLive && (typeof startTime !== 'number' || !Number.isSafeInteger(startTime) || startTime <= 0)) {
        throw new Error('Chaturbate did not provide a valid broadcast start time. A stable live notification cannot be generated.');
    }

    return {
        title: `${broadcaster} - Live status`,
        link,
        item: [
            {
                title: isLive ? `${broadcaster} is live` : `${broadcaster}: ${dossier.room_status}`,
                link,
                author: broadcaster,
                guid: isLive ? `${broadcaster}:${startTime}` : `${broadcaster}:inactive`,
                pubDate: isLive && typeof startTime === 'number' ? parseDate(startTime, 'X') : undefined,
                description: typeof dossier.num_viewers === 'number' && Number.isFinite(dossier.num_viewers) && dossier.num_viewers >= 0 ? `<p>Viewers: ${dossier.num_viewers}</p>` : undefined,
            },
        ],
    };
}
