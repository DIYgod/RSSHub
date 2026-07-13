import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import playwright from '@/utils/playwright';
import { setCookies } from '@/utils/playwright-utils';
import { isValidHost } from '@/utils/valid-host';

import type { PostListResponse, UserInfoResponse } from './types';
import { getCookieString, getHeaders, parseItem } from './utils';

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
        requirePuppeteer: true,
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
        const userInfoResponse = (await ofetch(userApi, {
            headers: getHeaders(),
        })) as UserInfoResponse;
        title = `Fanbox - ${userInfoResponse.body.user.name}`;
        description = userInfoResponse.body.description;
        image = userInfoResponse.body.user.iconUrl;
    } catch {
        // ignore
    }

    const postListResponse = (await ofetch(`https://api.fanbox.cc/post.listCreator?creatorId=${creator}&limit=20&withPinned=true`, { headers: getHeaders() })) as PostListResponse;

    const context = await playwright();
    const page = await context.newPage();

    const cookieString = getCookieString();
    if (cookieString) {
        await setCookies(page, cookieString, '.fanbox.cc');
    }

    await page.route('**/*', (route) => {
        const request = route.request();

        if (request.url().startsWith('https://api.fanbox.cc/post.info')) {
            route.continue();
            return;
        }

        request.resourceType() === 'document' ? route.continue() : route.abort();
    });
    await page.goto('https://www.fanbox.cc/', {
        waitUntil: 'domcontentloaded',
    });

    let items: DataItem[];
    try {
        items = await Promise.all(postListResponse.body.map((i) => parseItem(page, i)));
    } finally {
        await page.close();
        await context.close();
    }

    return {
        title,
        link: `https://${creator}.fanbox.cc`,
        description,
        image,
        item: items,
    };
}
