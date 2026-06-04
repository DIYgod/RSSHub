import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';

const baseUrl = 'https://www.alicesoft.com';

export const route: Route = {
    url: 'www.alicesoft.com/information',
    path: '/information/:category?/:game?',
    categories: ['game'],
    example: '/alicesoft/information/game/cat377',
    parameters: {
        category: 'Category in the URL, which can be accessed under カテゴリ一覧 on the website.',
        game: 'Game-specific subcategory in the URL, which can be accessed under カテゴリ一覧 on the website. In this case, the category value should be `game`.',
    },
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
            source: ['www.alicesoft.com/information', 'www.alicesoft.com/information/:category', 'www.alicesoft.com/information/:category/:game'],
            target: '/information/:category/:game',
        },
    ],
    name: 'ニュース',
    maintainers: ['keocheung'],
    handler,
};

async function handler(ctx) {
    const { category, game } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    let url = `${baseUrl}/information`;
    if (category) {
        url += `/${category}`;
        if (game) {
            url += `/${game}`;
        }
    }

    const response = await got(url);
    const $ = load(response.data);

    let items = $('div.cont-main li')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.find('p.txt').text(),
                link: item.find('a').attr('href'),
                pubDate: new Date(item.find('time').attr('datetime')),
            };
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link.startsWith(`${baseUrl}/information/`)) {
                return item;
            }
            return cache.tryGet(item.link, async () => {
                const contentResponse = await got(item.link);

                const content = load(contentResponse.data);
                content('iframe[src^="https://www.youtube.com/"]').removeAttr('height').removeAttr('width');
                item.description = `<div lang="ja-JP">${content('div.article-detail')
                    .html()
                    ?.replaceAll(/<p class="hl1">(.+?)<\/p>/g, '<h3>$1</h3>')
                    ?.replaceAll(/<p class="hl2">(.+?)<\/p>/g, '<h4>$1</h4>')}</div>`;
                return item;
            });
        })
    );

    return {
        title: 'ALICESOFT ' + $('article h2').clone().children().remove().end().text(),
        link: url,
        item: items,
        language: 'ja',
    };
}
