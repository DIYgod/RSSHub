import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

import { processTopics2Feed, RUBY_CHINA_HOST } from './utils';

export const route: Route = {
    path: '/topics/:type?',
    categories: ['bbs'],
    example: '/ruby-china/topics',
    parameters: { type: '主题类型，在 URL 可以找到' },
    name: '主题',
    maintainers: ['ahonn'],
    description: `未登录状态下抓取页面非实时更新

| 主题类型 | type        |
| -------- | ----------- |
| 精华贴   | excellent   |
| 优质帖子 | popular     |
| 无人问津 | no\\_reply   |
| 最新回复 | last\\_reply |
| 最新发布 | last        |`,
    handler,
};

const types: Record<string, string> = {
    excellent: '精华贴',
    popular: '优质帖子',
    no_reply: '无人问津',
    last_reply: '最新回复',
    last: '最新发布',
};

async function handler(ctx: Context) {
    const { type } = ctx.req.param();

    let title = 'Ruby China';
    let link = `${RUBY_CHINA_HOST}/topics`;
    const typeName = type ? types[type] : undefined;
    if (typeName) {
        title += ` - ${typeName}`;
        link += `/${type}`;
    }

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
