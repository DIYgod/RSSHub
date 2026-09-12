import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/tracks/:user',
    categories: ['multimedia'],
    example: '/soundcloud/tracks/angeart',
    parameters: { user: 'User name' },
    name: 'Tracks',
    maintainers: ['fallenhh'],
    handler,
};

const apiBaseUrl = 'https://api-v2.soundcloud.com';

async function handler(ctx: Context) {
    const { user } = ctx.req.param();
    const link = `https://soundcloud.com/${user}/tracks`;

    const html = await ofetch(`https://soundcloud.com/${user}`);
    const hydration = JSON.parse(html.match(/window\.__sc_hydration = (.*?);<\/script>/)![1]);
    const userInfo = hydration.find((h) => h.hydratable === 'user').data;
    const clientId = hydration.find((h) => h.hydratable === 'apiClient').data.id;
    const data = await ofetch(`${apiBaseUrl}/users/${userInfo.id}/tracks`, {
        query: {
            client_id: clientId,
            limit: ctx.req.query('limit') ?? 20,
            offset: 0,
            linked_partitioning: 1,
        },
    });

    const items = data.collection.map((track) => ({
        title: track.title,
        link: track.permalink_url,
        guid: track.permalink_url,
        author: track.user.username,
        pubDate: parseDate(track.display_date),
        description: `<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(track.permalink_url)}"></iframe>${track.description ? `<p>${track.description.replaceAll('\n', '<br>')}</p>` : ''}`,
        image: track.artwork_url.replace('-large.', '-t500x500.'),
        category: [track.genre, track.tag_list.split(' ')],
    }));

    return {
        title: `${userInfo.username} - Tracks`,
        link,
        description: userInfo.description,
        image: userInfo.avatar_url,
        item: items,
    };
}
