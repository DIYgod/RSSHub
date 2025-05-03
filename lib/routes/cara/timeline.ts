import type { Data, DataItem, Route } from '@/types';
import type { PostsResponse } from './types';
import { customFetch, parseUserData } from './utils';
import { API_HOST, CDN_HOST, HOST } from './constant';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import path from 'node:path';

export const route: Route = {
    path: ['/timeline/:user'],
    categories: ['social-media', 'popular'],
    example: '/cara/timeline/fengz',
    parameters: { user: 'username' },
    name: 'Timeline',
    maintainers: ['KarasuShin'],
    handler,
    radar: [
        {
            source: ['cara.app/:user', 'cara.app/:user/*'],
            target: '/timeline/:user',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    const user = ctx.req.param('user');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 15;
    const userInfo = await parseUserData(user);

    const api = `${API_HOST}/posts/getAllByUser?slug=${userInfo.slug}&take=${limit}`;

    const timelineResponse = await customFetch<PostsResponse>(api);

    const items = timelineResponse.data.map((item) => {
        const description = art(path.join(__dirname, 'templates/post.art'), {
            content: item.content,
            images: item.images.filter((i) => !i.isCoverImg).map((i) => ({ ...i, src: `${CDN_HOST}/${i.src}` })),
        });
        return {
            title: item.title || item.content,
            pubDate: parseDate(item.createdAt),
            link: `${HOST}/post/${item.id}`,
            description,
        } as DataItem;
    });

    return {
        title: `Timeline - ${userInfo.name}`,
        link: `${HOST}/${user}/all`,
        image: `${CDN_HOST}/${userInfo.photo}`,
        item: items,
    };
}
