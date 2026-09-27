import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { isValidHost } from '@/utils/valid-host';

import type { PostListResponse, UserInfoResponse } from './types';
import { getHeaders, parseItem } from './utils';

export const route: Route = {
    path: '/:creator',
    categories: ['social-media'],
    example: '/fanbox/official',
    parameters: { creator: 'fanbox user name' },
    maintainers: ['KarasuShin', 'pseudoyu'],
    name: 'Creator',
    handler,
    features: {
        requireConfig: [
            {
                name: 'FANBOX_SESSION_ID',
                description: 'Required for private posts. Can be found in browser DevTools -> Application -> Cookies -> https://www.fanbox.cc -> FANBOXSESSID',
                optional: true,
            },
        ],
        requirePuppeteer: false,
        nsfw: true,
    },
};

async function handler(ctx: Context): Promise<Data> {
    const creator = ctx.req.param('creator');
    if (!isValidHost(creator)) {
        throw new InvalidParameterError('Invalid user name');
    }

    let title = `Fanbox - ${creator}`;

    let description: string | undefined;

    let image: string | undefined;

    try {
        const userApi = `https://api.fanbox.cc/creator.get?creatorId=${creator}`;
        const userInfoResponse = await ofetch<UserInfoResponse>(userApi, {
            headers: getHeaders(),
        });
        title = `Fanbox - ${userInfoResponse.body.user.name}`;
        description = userInfoResponse.body.description;
        image = userInfoResponse.body.user.iconUrl;
    } catch {
        // ignore
    }

    const postListResponse = await ofetch<PostListResponse>(`https://api.fanbox.cc/post.listCreator?creatorId=${creator}&limit=20&withPinned=true`, { headers: getHeaders() });

    const items: DataItem[] = await Promise.all(postListResponse.body.posts.map((i) => parseItem(i)));

    return {
        title,
        link: `https://${creator}.fanbox.cc`,
        description,
        image,
        item: items,
    };
}
