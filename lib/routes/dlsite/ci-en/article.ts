import { load } from 'cheerio';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import md5 from '@/utils/md5';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/ci-en/:id/article',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/dlsite/ci-en/7400/article',
    parameters: { id: 'Creator id, can be found in URL' },
    features: {
        requireConfig: [{ name: 'CI_EN_COOKIE', optional: true, description: 'Cookie of a signed-in Ci-en account with access to the desired articles' }],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        nsfw: true,
    },
    radar: [
        {
            source: ['ci-en.dlsite.com/creator/:id/article/843558', 'ci-en.dlsite.com/'],
        },
    ],
    name: "Ci-en Creators' Article",
    maintainers: ['nczitzk'],
    description: 'Set `CI_EN_COOKIE` on a self-hosted instance to retrieve articles available to your account and subscribed plans.',
    handler,
};

async function handler(ctx) {
    const id = ctx.req.param('id') ?? '7400';
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : 10;

    const rootUrl = 'https://ci-en.dlsite.com';
    const currentUrl = `${rootUrl}/creator/${id}/article?mode=list`;
    const cookie = config.ciEn.cookie;
    const cacheScope = cookie ? md5(cookie) : 'public';
    const headers = cookie ? { Cookie: cookie } : {};

    const response = await got({
        method: 'get',
        url: currentUrl,
        headers,
    });

    const $ = load(response.data);

    let items = $('.c-postedArticle .c-cardLink, .c-postedArticle-info a')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                title: $item.find('.e-title').text() || $item.text(),
                link: new URL($item.attr('href')!, rootUrl).href,
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(`dlsite:ci-en:${cacheScope}:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                    headers,
                });

                const content = load(detailResponse.data);

                content('.article-title').remove();

                content('.file-player-image').each((_, el) => {
                    content(el).replaceWith(`<img src="${content(el).attr('data-actual')}">`);
                });

                item.description = content('article').html();
                item.pubDate = timezone(parseDate(content('.e-date').first().text()), 9);
                item.category = content('.c-hashTagList-item')
                    .toArray()
                    .map((t) => content(t).text().split('#').pop()!.trim());

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
