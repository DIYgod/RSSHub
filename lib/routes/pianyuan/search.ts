import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import utils from './utils';

export const route: Route = {
    path: '/indexers/pianyuan/results/search/api',
    radar: [
        {
            source: ['pianyuan.org/'],
            target: '/index',
        },
    ],
    name: 'Unknown',
    maintainers: ['jerry1119'],
    handler,
    url: 'pianyuan.org/',
};

async function handler(ctx) {
    const link_base = 'https://pianyuan.org/';
    const description = '搜索';
    // 适配jackett 搜索api, eg: https://rsshub.app/pianyuan/indexers/pianyuan/results/search/api?t=test&q=halo
    const searchKey = ctx.originalUrl.split('&q=')[1];
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

    const detailLinks = [];

    await Promise.all(
        searchLinks.map(async (e) => {
            const link = new URL(e, link_base).href;
            const single = await cache.tryGet(link, async () => {
                const res = await utils.request(link, cache);
                const content = load(res.data);
                content('.ico.ico_bt')
                    .toArray()
                    .map((a) => detailLinks.push($(a).attr('href')));
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
