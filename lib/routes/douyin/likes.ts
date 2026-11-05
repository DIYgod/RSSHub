import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';

import { getSavedPosts } from './saved-posts';

export const route: Route = {
    path: '/likes/:uid',
    name: '喜欢的视频',
    example: '/douyin/likes/self',
    categories: ['social-media'],
    maintainers: ['DIYgod'],
    parameters: {
        uid: '用户页面 URL 中的 sec_user_id，或者 self 表示 DOUYIN_COOKIE 对应的登录账号。',
    },
    features: {
        requirePuppeteer: true,
        antiCrawler: true,
        requireConfig: [{ name: 'DOUYIN_COOKIE', optional: true, description: '订阅自己的喜欢列表时必须配置；其他用户的列表须对当前账号公开。' }],
    },
    description: '只读取喜欢列表的首屏。设为私密的列表仅对应账号能够访问。发布时间为视频原始发布时间，点赞时间没有公开提供。',
    handler,
};

async function handler(ctx) {
    const uid = ctx.req.param('uid');
    if (uid !== 'self' && !uid.startsWith('MS4wLjABAAAA')) {
        throw new InvalidParameterError('UID must be self or a sec_user_id starting with MS4wLjABAAAA.');
    }
    return await getSavedPosts('likes', uid);
}
