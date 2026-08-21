import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';

import utils from './utils';

export const route: Route = {
    path: '/indexers/pianyuan/results/search/api',
    categories: ['multimedia'],
    example: '/pianyuan/indexers/pianyuan/results/search/api?t=test&q=长津湖',
    radar: [
        {
            source: ['pianyuan.org/'],
            target: '/index',
        },
    ],
    name: '搜索',
    maintainers: ['jerry1119'],
    handler,
    url: 'pianyuan.org/',
    description: '搜索路由模仿 jackett 的搜索 api, 以提供给 nastools 使用，填写在 nastools 配置 indexer 中',
};

async function handler(ctx) {
    const link_base = 'https://pianyuan.org/';
    const description = '搜索';
    // 适配jackett 搜索api, eg: https://rsshub.app/pianyuan/indexers/pianyuan/results/search/api?t=test&q=halo
    const searchKey = ctx.originalUrl.split('&q=', 2)[1];
    const link = link_base + `search?q=${searchKey}`;

    const response = await utils.request(link, cache);
    const $ = load(response.data);
    // 只获取第一页的搜索结果
    const searchLinks = $('.nomt > a')
        .toArray()
        .map((a) => $(a).attr('href'));
    if (searchLinks.length === 0) {
        throw new Error('pianyuan 搜索失败');
    }

    const detailLinks: Array<string | undefined> = [];

    await Promise.all(
        searchLinks.map(async (e) => {
            const link = new URL(e!, link_base).href;
            const single = await cache.tryGet(link, async (): Promise<any> => {
                const res = await utils.request(link, cache);
                const content = load(res.data);
                detailLinks.push(
                    ...content('.ico.ico_bt')
                        .toArray()
                        .map((a) => $(a).attr('href'))
                );
            });
            return single;
        })
    );

    const items = await utils.ProcessFeed(detailLinks, cache);

    return {
        title: '片源网',
        description,
        link: link_base,
        item: items,
    };
}
