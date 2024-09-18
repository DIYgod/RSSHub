import type { Data, Route } from '@/types';
import { getPostItems } from './base';
import ofetch from '@/utils/ofetch';
import cache from '@/utils/cache';

export const route: Route = {
    name: 'Author Posts',
    url: 'voronoiapp.com',
    path: '/author/:username',
    categories: ['reading'],
    radar: [
        {
            source: ['www.voronoiapp.com/author/:username'],
            target: '/author/:username',
        },
    ],
    maintainers: ['cesaryuan'],
    example: '/voronoiapp/author/visualcapitalist',
    parameters: {
        username: 'The username of the author',
    },
    handler: async (ctx) => {
        const { username } = ctx.req.param();
        const uid = await getUidFromUsername(username);
        const items = await getPostItems({ order: 'DESC', author: uid });
        return {
            title: `Voronoi Posts by ${username}`,
            link: `https://www.voronoiapp.com/author/${username}`,
            item: items,
            allowEmpty: true,
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
