import type { Status, User } from 'fanfou-sdk';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';

import { getFanfou } from './utils';

export const route: Route = {
    path: '/favorites/:uid',
    categories: ['social-media'],
    example: '/fanfou/favorites/wangxing',
    parameters: { uid: '用户的uid' },
    name: '用户收藏',
    maintainers: ['junbaor'],
    features: {
        requireConfig: [
            { name: 'FANFOU_CONSUMER_KEY', description: '饭否 Consumer Key' },
            { name: 'FANFOU_CONSUMER_SECRET', description: '饭否 Consumer Secret' },
            { name: 'FANFOU_USERNAME', description: '饭否用户名' },
            { name: 'FANFOU_PASSWORD', description: '饭否密码' },
        ],
    },
    handler,
};

async function handler(ctx: Context) {
    if (!config.fanfou || !config.fanfou.consumer_key || !config.fanfou.consumer_secret || !config.fanfou.username || !config.fanfou.password) {
        throw new ConfigNotFoundError('Fanfou RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const { uid } = ctx.req.param();
    const fanfou = await getFanfou();
    const timeline = await fanfou.get<Status[]>(`/favorites/${encodeURIComponent(uid)}`, { id: uid, mode: 'lite', format: 'html' });

    const result = timeline.map((item) => {
        let imgHTML = '';
        if (item.photo) {
            imgHTML = `<br/><img src="${item.photo.largeurl}" alt="饭否动态图片"/>`;
        }
        return {
            title: item.text,
            author: item.user.name,
            description: item.text + imgHTML,
            pubDate: item.createdAt,
            link: `https://fanfou.com/statuses/${item.id}`,
        };
    });

    const users = await fanfou.get<User>('/users/show', { id: uid });
    const authorName = users.screenName;

    return {
        title: `${authorName}的饭否收藏`,
        link: `https://fanfou.com/favorites/${encodeURIComponent(uid)}`,
        description: `${authorName}的饭否收藏`,
        item: result,
    };
}
