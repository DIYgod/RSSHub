import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

import { apiRoot, parsePost } from './utils';

export const route: Route = {
    path: '/:id',
    categories: ['social-media'],
    example: '/soulapp/ekxWSkVQSWtZUkJ1WUNwTVhMR0V3QT09',
    parameters: { id: '用户 id, 分享用户主页时的 URL 的 userIdEcpt 参数' },
    name: '瞬间更新',
    maintainers: ['ImSingee'],
    handler,
};

async function handler(ctx: Context) {
    const { id: userIdEcpt } = ctx.req.param();

    const user = await cache.tryGet(`soulapp:user:${userIdEcpt}`, async () => {
        const infoResponse = await ofetch(`${apiRoot}/html/v2/user/info?userIdEcpt=${userIdEcpt}`);
        if (!infoResponse.data) {
            throw new InvalidParameterError('Soul profile API returned no user data. Check the user ID and original user page, then try again later.');
        }
        return infoResponse.data;
    });

    const response = await ofetch(`${apiRoot}/html/v2/post/homepage?userIdEcpt=${userIdEcpt}`);
    if (response.success === false) {
        throw new Error(`Soul post API failed (${response.code}): ${response.message || 'No error details returned'}. Check the original user page and try again later.`);
    }
    const posts = response.data ?? [];

    return {
        title: `「${user.signature}」的瞬间`,
        link: `https://w3.soulsmile.cn/activity/#/web/user?userIdEcpt=${userIdEcpt}`,
        image: `https://china-img.soulapp.cn/heads/${user.avatarName}.png`,
        item: posts.map((item) => parsePost(item)),
    };
}
