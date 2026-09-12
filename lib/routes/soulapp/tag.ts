import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { apiRoot, parsePost, signedHeaders } from './utils';

const tagPostPath = '/html/v2/tag/post';

export const route: Route = {
    path: '/posts/tag/:tid{.+}',
    categories: ['social-media'],
    example: '/soulapp/posts/tag/VHdZN0ZpVUp4M2s9',
    parameters: { tid: '话题 id, 分享话题时的 URL 的 tagIdEcpt 参数' },
    description: '提供不同内容的 `tid`, 可以得到不同的话题瞬间推荐，如果想看多个话题可以用 `/` 把不同的 `tid` 连起来，例如: `VHdZN0ZpVUp4M2s9/d1k5VEt2d0tkcW89`',
    name: '话题瞬间',
    maintainers: ['BugWriter2'],
    handler,
};

async function handler(ctx: Context) {
    const { tid } = ctx.req.param();
    const tagIds = tid.split('/');

    const responses = await Promise.all(
        tagIds.map((tagIdEcpt) =>
            ofetch(`${apiRoot}${tagPostPath}`, {
                query: { tagIdEcpt },
                headers: signedHeaders(tagPostPath, { tagIdEcpt }),
            })
        )
    );

    const tagNames = responses.map((response) => response.data?.tagName).filter(Boolean);
    const items = responses.flatMap((response) => (response.data?.posts ?? []).map((item) => parsePost(item)));

    return {
        title: `Soul 话题 - ${tagNames.join('、')}`,
        link: `https://w3.soulsmile.cn/activity/#/web/tag?tagIdEcpt=${tagIds[0]}`,
        item: items.filter((value, index, array) => array.findIndex((item) => item.guid === value.guid) === index),
    };
}
