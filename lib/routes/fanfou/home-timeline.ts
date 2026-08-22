import { getEntities, getPlainText, type Status } from 'fanfou-sdk';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';

import { getFanfou } from './utils';

export const route: Route = {
    path: '/home_timeline',
    categories: ['social-media'],
    example: '/fanfou/home_timeline',
    name: '当前登录用户的时间线',
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

async function handler() {
    if (!config.fanfou || !config.fanfou.consumer_key || !config.fanfou.consumer_secret || !config.fanfou.username || !config.fanfou.password) {
        throw new ConfigNotFoundError('Fanfou RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }

    const fanfou = await getFanfou();
    const timeline = await fanfou.get<Status[]>('/statuses/home_timeline', { mode: 'lite', format: 'html' });

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
            link: `http://fanfou.com/statuses/${item.id}`,
        };
    });

    return {
        title: '我的饭否动态',
        link: 'https://fanfou.com/home',
        description: '我的饭否动态',
        item: result,
    };
}
