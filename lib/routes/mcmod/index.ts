import { DataItem, Route } from '@/types';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import ofetch from '@/utils/ofetch';
import path from 'node:path';
import cache from '@/utils/cache';
import timezone from '@/utils/timezone';
import { art } from '@/utils/render';

const render = (mod) => art(path.join(__dirname, 'templates/mod.art'), { mod });

export const route: Route = {
    path: '/:type',
    categories: ['game'],
    example: '/mcmod/new',
    parameters: { type: '查询类型，详见下表' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新MOD',
    maintainers: ['hualiong'],
    description: `\`:type\` 类型可选如下

| 随机显示MOD | 最新收录MOD | 最近编辑MOD |
| ------ | --- | ---- |
| random | new | edit |`,
    handler: async (ctx) => {
        const type = ctx.req.param('type');
        const $get = ofetch.create({ baseURL: 'https://www.mcmod.cn' });
        const response = await $get('/');

        const $ = load(response);
        const typeName = $(`div.left > ul > li[i='${type}']`).attr('title');
        const list = $(`#indexNew_${type} > .block`)
            .toArray()
            .map((item): DataItem => {
                const each = $(item);
                const time = each.find('div .time');
                return {
                    title: each.find('div > .name > a').text(),
                    image: each.find('img').attr('src')?.split('@')[0],
                    link: each.children('a').attr('href'),
                    pubDate: time.attr('title') && timezone(parseDate(time.attr('title')!.substring(6), 'YYYY-MM-DD HH:mm:ss'), +8),
                };
            });

        const items = await Promise.all(
            list.map((item) =>
                cache.tryGet(item.link!, async () => {
                    const response = await $get(item.link!);
                    const $ = load(response);

                    item.author = $('.author li')
                        .toArray()
                        .map((item) => {
                            const each = $(item);
                            const name = each.find('.name a');
                            return {
                                name: name.text(),
                                url: 'https://www.mcmod.cn' + name.attr('href'),
                                avatar: each.find('.avatar img').attr('src')?.split('?')[0],
                            };
                        });

                    const html = $('.common-text[data-id="1"]').html()!;
                    const support = $('.mcver > ul > ul')
                        .toArray()
                        .map((e) => {
                            const ul = $(e);
                            const label = ul.children('li:first-child').text();
                            const versions = ul
                                .children('li:not(:first-child)')
                                .toArray()
                                .map((e) => $(e).text())
                                .join('，');
                            return { label, versions };
                        });

                    item.description =
                        render({
                            pic: 'https:' + item.image,
                            label: $('.class-info  li.col-lg-4')
                                .toArray()
                                .map((e) => $(e).text()),
                            support,
                        }) + html.replaceAll(/\ssrc=".+?"/g, '').replaceAll('data-src', 'src');
                    return item;
                })
            )
        );

        return {
            title: `${typeName} - MC百科`,
            description: $('meta[name="description"]').attr('content'),
            link: 'https://www.mcmod.cn',
            item: items as DataItem[],
        };
    },
};
