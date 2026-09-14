import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';

const rootUrl = 'https://art.icity.ly';

export const route: Route = {
    path: '/imuseum/:city/:type?',
    categories: ['travel'],
    example: '/icity/imuseum/guangzhou/latest',
    parameters: {
        city: '城市，取自站点 URL 中的城市路径，如 guangzhou、shanghai、beijing',
        type: {
            description: '展览列表类型',
            default: 'latest',
            options: [
                { value: 'all', label: '全部' },
                { value: 'latest', label: '最新' },
                { value: 'hot', label: '热门' },
                { value: 'end_soon', label: '即将结束' },
                { value: 'coming', label: '即将开始' },
                { value: 'outdated', label: '已结束' },
            ],
        },
    },
    name: 'iMuseum 城市展览',
    maintainers: ['chouj'],
    radar: [
        {
            source: ['art.icity.ly/:city'],
            target: '/imuseum/:city',
        },
    ],
    description: 'iMuseum（每日环球展览）各城市正在进行与即将开始的展览。城市与类型均取自站点 URL 路径，例如 `guangzhou/latest`。',
    handler: async (ctx) => {
        const { city } = ctx.req.param();
        const type = ctx.req.param('type') ?? 'latest';
        const currentUrl = `${rootUrl}/${city}/${type}`;

        const response = await ofetch(currentUrl);
        const $ = load(response);

        // The city switcher is the only element with a dropdown, the `all` page has an extra "world" section above it.
        const cityName = $('a[data-toggle="dropdown"] h3').text();
        // Scoped to `ul.nav-pills` because the top navbar has another `li.active`.
        const typeName = $('ul.nav-pills li.active a').text();

        // The `all` page also has a featured list (`ul.imsm-entries.thumb`) with a different markup,
        // whose items are shared across every city, so only the main list is used.
        const list = $('ul.imsm-entries.list > li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $info = $item.find('a.info');

                return {
                    title: $info.find('div.title').text(),
                    link: new URL($info.attr('href')!, rootUrl).href,
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResponse = await ofetch(item.link);
                    const $detail = load(detailResponse);
                    const $entry = $detail('div.imsm-entry');

                    const cover = $entry.find('img.fit-width').attr('src');

                    const $description = $detail('<div>');
                    if (cover) {
                        $description.append($detail('<img>').attr('src', cover));
                    }
                    $description.append($entry.find('table.info-fields'), $entry.find('div.content'));

                    return {
                        title: item.title,
                        link: item.link,
                        description: $description.html(),
                        image: cover,
                    };
                })
            )
        );

        return {
            title: `${cityName}${typeName}展览 - iMuseum`,
            link: currentUrl,
            language: 'zh-CN',
            item: items,
        };
    },
};
