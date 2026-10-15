import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/dynamic/:uid?',
    categories: ['other'],
    example: '/afdian/dynamic/@afdian',
    parameters: { uid: '用户id，用户动态页面url里可找到' },
    name: '用户动态',
    maintainers: ['sanmmm'],
    handler,
};

async function handler(ctx) {
    const urlSlug = ctx.req.param('uid')?.replace('@', '');
    if (!urlSlug) {
        throw new InvalidParameterError('A creator ID is required. Find it in the creator page URL, for example /afdian/dynamic/@afdian.');
    }
    const baseUrl = 'https://afdian.com';
    const userInfoRes = await got(`${baseUrl}/api/user/get-profile-by-slug`, {
        searchParams: {
            url_slug: urlSlug,
        },
    });
    const { user_id, name, avatar } = userInfoRes.data.data.user;

    const dynamicRes = await got(`${baseUrl}/api/post/get-list`, {
        searchParams: {
            type: 'old',
            user_id,
        },
    });
    const list = dynamicRes.data.data.list.map((item) => {
        const { publish_time, title, content, pics = [], post_id } = item;
        return {
            title,
            description: [content, pics.map((url) => `<img src="${url}"/>`).join('')].filter((str) => !!str).join('<br/>'),
            link: `${baseUrl}/p/${post_id}`,
            pubDate: new Date(Number(publish_time) * 1000).toUTCString(),
        };
    });
    return {
        title: `${name}的爱发电动态`,
        description: `${name}的爱发电动态`,
        image: avatar,
        link: `${baseUrl}/@${urlSlug}`,
        item: list,
    };
}
