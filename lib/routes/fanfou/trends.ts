import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';

import { getFanfou } from './utils';

export const route: Route = {
    path: '/trends',
    categories: ['social-media'],
    example: '/fanfou/trends',
    name: '热门话题',
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
    const response = await fanfou.get<{ trends: Array<{ name: string; url: string }> }>('/trends/list');

    const result = response.trends.map((item) => ({
        title: item.name,
        description: item.name,
        link: item.url,
    }));

    return {
        title: '饭否热门话题',
        link: 'https://fanfou.com/q/',
        description: '饭否热门话题',
        item: result,
        allowEmpty: true,
    };
}
