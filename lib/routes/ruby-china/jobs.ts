import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processTopics2Feed, RUBY_CHINA_HOST } from './utils';

export const route: Route = {
    path: '/jobs',
    categories: ['bbs'],
    example: '/ruby-china/jobs',
    name: '招聘',
    maintainers: ['ahonn'],
    description: '未登录状态下抓取页面非实时更新',
    handler,
};

async function handler() {
    const title = 'Ruby China - 招聘';
    const link = `${RUBY_CHINA_HOST}/jobs`;

    const response = await ofetch(link);
    const $ = load(response);
    const list = $('.topics .topic').toArray();

    const result = await processTopics2Feed(list);

    return {
        title,
        link,
        description: title,
        item: result,
    };
}
