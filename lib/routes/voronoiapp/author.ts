import type { Data, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { CommonDataProperties, CommonRouteProperties, getPostItems } from './common';

export const route: Route = {
    ...CommonRouteProperties,
    name: 'Author Posts',
    path: '/author/:username',
    radar: [
        {
            source: ['www.voronoiapp.com/author/:username'],
            target: '/author/:username',
        },
    ],
    example: '/voronoiapp/author/visualcapitalist',
    parameters: {
        username: 'The username of the author',
    },
    handler: async (ctx) => {
        const { username } = ctx.req.param();
        const uid = await getUidFromUsername(username);
        const items = await getPostItems({ order: 'DESC', author: uid });
        return {
            ...CommonDataProperties,
            title: `Voronoi Posts by ${username}`,
            link: `https://www.voronoiapp.com/author/${username}`,
            item: items,
        } as Data;
    },
};
async function getUidFromUsername(username: string): Promise<string> {
    return (await cache.tryGet(`voronoiapp-author-${username}`, async () => {
        const response = await ofetch<'text'>(`https://www.voronoiapp.com/author/${username}`);
        const match = response.match(/\\"uid\\":\\"([\w-]+)\\"/);
        if (!match) {
            throw new Error(`No UID found for username: ${username}`);
        }
        return match[1];
    })) as string;
}
