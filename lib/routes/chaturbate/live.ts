import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:username',
    categories: ['live'],
    view: ViewType.Notifications,
    example: '/chaturbate/emyii',
    parameters: { username: 'Broadcaster username' },
    features: {
        nsfw: true,
    },
    radar: [
        {
            source: ['chaturbate.com/:username'],
        },
    ],
    name: 'Live',
    maintainers: ['TonyRL'],
    handler,
};

async function handler(ctx: Context) {
    const { username } = ctx.req.param();
    const link = `https://chaturbate.com/${username}/`;

    const room = await ofetch(`https://chaturbate.com/api/chatvideocontext/${username}/`);

    const item: DataItem[] = [];
    if (room.room_status !== 'offline') {
        item.push({
            title: room.room_title,
            author: room.broadcaster_username,
            category: room.room_title.matchAll(/#(\w+)/g).toArray().map((m) => m[1]),
            description: `<img src="https://thumb.live.mmcdn.com/riw/${username}.jpg"><p>${room.num_viewers} viewers</p>`,
            pubDate: parseDate(room.start_timestamp, 'X'),
            guid: `${username}-${room.start_timestamp}`,
            link,
        });
    }

    return {
        title: `Chaturbate - ${room.broadcaster_username} - Live`,
        link,
        item,
        allowEmpty: true,
    };
}
