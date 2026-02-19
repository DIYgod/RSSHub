import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:type?/:category?',
    categories: ['game'],
    example: '/gamersecret',
    parameters: { type: 'Type, see below, Latest News by default', category: 'Category, see below' },
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
            source: ['gamersecret.com/:type', 'gamersecret.com/:type/:category', 'gamersecret.com/'],
        },
    ],
    name: 'Category',
    maintainers: ['nczitzk'],
    handler,
    description: `| Latest News | PC | Playstation | Nintendo | Xbox | Moblie |
| ----------- | -- | ----------- | -------- | ---- | ------ |
| latest-news | pc | playstation | nintendo | xbox | moblie |

  Or

| GENERAL          | GENERAL EN         | MOBILE          | MOBILE EN         |
| ---------------- | ------------------ | --------------- | ----------------- |
| category/general | category/generalen | category/mobile | category/mobileen |

| NINTENDO          | NINTENDO EN         | PC          | PC EN         |
| ----------------- | ------------------- | ----------- | ------------- |
| category/nintendo | category/nintendoen | category/pc | category/pcen |

| PLAYSTATION          | PLAYSTATION EN         | REVIEWS          |
| -------------------- | ---------------------- | ---------------- |
| category/playstation | category/playstationen | category/reviews |

| XBOX          | XBOX EN         |
| ------------- | --------------- |
| category/xbox | category/xboxen |`,
};

async function handler(ctx) {
    const type = ctx.req.param('type') ?? 'latest-news';
    const category = ctx.req.param('category') ?? '';

    const rootUrl = 'https://www.gamersecret.com';
    const currentUrl = `${rootUrl}/${type}${category ? `/${category}` : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('.jeg_post_title a')
        .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 20)
        .toArray()
        .map((item) => {
            item = $(item);

            return {
                title: item.text(),
                link: item.attr('href'),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                content('img').each(function () {
                    content(this).attr('src', content(this).attr('data-src'));
                });

                item.author = content('.jeg_meta_author').text().replace(/by/, '');
                item.pubDate = timezone(parseDate(detailResponse.data.match(/datePublished":"(.*)","dateModified/)[1]), +8);
                item.description = content('.thumbnail-container').html() + content('.elementor-text-editor, .content-inner').html();

                return item;
            })
        )
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
