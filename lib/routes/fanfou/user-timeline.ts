import { getEntities, getPlainText, type Status } from 'fanfou-sdk';
import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';

import { getFanfou } from './utils';

export const route: Route = {
    path: '/user_timeline/:uid',
    categories: ['social-media'],
    example: '/fanfou/user_timeline/wangxing',
    parameters: { uid: '用户的uid' },
    name: '用户动态',
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
    const timeline = await fanfou.get<Status[]>('/statuses/user_timeline', { id: uid, mode: 'lite', format: 'html' });

    const result = timeline.map((item) => {
        let imgHTML = '';
        if (item.photo) {
            imgHTML = `<br/><img src="${item.photo.largeurl.replace(/@.[^\n\r.\u{2028}\u{2029}]*\..+$/u, '')}" alt="饭否动态图片"/>`;
        }
        return {
            title: getPlainText(getEntities(item.text)),
            author: item.user.name,
            description: item.text + imgHTML,
            pubDate: item.createdAt,
            link: `https://fanfou.com/statuses/${item.id}`,
        };
    });

    const authorName = result[0].author;

    return {
        title: `${authorName}的饭否`,
        link: `https://fanfou.com/${uid}`,
        description: `${authorName}的饭否`,
        item: result,
    };
}
