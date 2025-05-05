import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import util from './utils';

export const route: Route = {
    path: '/collection/:id',
    categories: ['social-media', 'popular'],
    view: ViewType.Articles,
    example: '/jianshu/collection/xYuZYD',
    parameters: { id: '专题 id, 可在专题页 URL 中找到' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.jianshu.com/c/:id'],
        },
    ],
    name: '专题',
    maintainers: ['DIYgod', 'HenryQW', 'JimenezLi'],
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id');

    const response = await got({
        method: 'get',
        url: `https://www.jianshu.com/c/${id}`,
        headers: {
            Referer: `https://www.jianshu.com/c/${id}`,
        },
    });

    const data = response.data;

    const $ = load(data);
    const list = $('.note-list li').toArray();

    const result = await util.ProcessFeed(list, cache);

    return {
        title: $('title').text(),
        link: `https://www.jianshu.com/c/${id}`,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: result,
    };
}
