import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { API_HOST, CDN_HOST, HOST } from './constant';
import { renderPost } from './templates/post';
import type { PostsResponse } from './types';
import { customFetch, parseUserData } from './utils';

export const route: Route = {
    path: '/likes/:user',
    categories: ['social-media'],
    example: '/cara/likes/fengz',
    parameters: { user: 'username' },
    name: 'Likes',
    maintainers: ['KarasuShin'],
    features: {
        requireConfig: [
            {
                name: 'CARA_COOKIE',
                description: 'A logged-in cara.app Cookie containing __Secure-next-auth.session-token. Obtain it from your own browser session; it is only sent to https://cara.app.',
            },
        ],
    },
    handler,
    radar: [
        {
            source: ['cara.app/:user', 'cara.app/:user/*'],
            target: '/likes/:user',
        },
    ],
};

async function handler(ctx): Promise<Data> {
    if (!config.cara.cookie) {
        throw new ConfigNotFoundError('Cara likes requires CARA_COOKIE from a logged-in cara.app session.');
    }

    const user = ctx.req.param('user');
    const limit = getRouteLimit(ctx, 15);
    const userInfo = await parseUserData(user);

    const api = `${API_HOST}/posts/getAllLikesByUser?slug=${userInfo.slug}&take=${limit}`;

    const timelineResponse = await customFetch<PostsResponse>(api);

    const items = timelineResponse.data.map((item) => {
        const description = renderPost({
            content: item.content,
            images: item.images.filter((i) => !i.isCoverImg).map((i) => ({ ...i, src: `${CDN_HOST}/${i.src}` })),
        });
        return {
            title: item.title || item.content,
            pubDate: parseDate(item.createdAt),
            link: `${HOST}/post/${item.id}`,
            description,
        };
    });

    return {
        title: `Likes - ${userInfo.name}`,
        link: `${HOST}/${user}/likes`,
        image: `${CDN_HOST}/${userInfo.photo}`,
        item: items,
    };
}
