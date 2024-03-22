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
    const url_slug = ctx.req.param('uid').replace('@', '');
    const baseUrl = 'https://afdian.net';
    const userInfoRes = await got(`${baseUrl}/api/user/get-profile-by-slug`, {
        searchParams: {
            url_slug,
        },
    });
    const userInfo = userInfoRes.data.data.user;
    const { user_id, name, avatar } = userInfo;

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
        link: `${baseUrl}/@${url_slug}`,
        item: list,
    };
}
