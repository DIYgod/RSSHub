import { load } from 'cheerio';
import { renderToString } from 'hono/jsx/dom/server';

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

        // The city switcher is the only section with a dropdown, the `all` page additionally has a "world" section above it.
        const cityName = $('a[data-toggle="dropdown"] h3').first().text().trim();
        const typeName = $('ul.nav-pills li.active a').text().trim();

        // The `all` page also contains a featured list (`ul.imsm-entries.thumb`) with a different
        // markup, whose items are shared across every city, so only the main list is used here.
        const list = $('ul.imsm-entries.list > li')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const $info = $item.find('a.info');

                return {
                    title: $info.find('div.title').text().trim(),
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
                    const infoTable = $entry.find('table.info-fields').html();
                    const content = $entry.find('div.content').html();

                    return {
                        title: item.title,
                        link: item.link,
                        description: renderToString(
                            <div>
                                {cover && <img src={cover} />}
                                {infoTable && <div dangerouslySetInnerHTML={{ __html: infoTable }} />}
                                {content && <div dangerouslySetInnerHTML={{ __html: content }} />}
                            </div>
                        ),
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
