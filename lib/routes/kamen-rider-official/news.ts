import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/kamen-rider-official/news',
    parameters: { category: 'Category, see below, すべて by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '最新情報',
    maintainers: ['nczitzk'],
    handler,
    description: `| Category                               |
| -------------------------------------- |
| すべて                                 |
| テレビ                                 |
| 映画・V シネマ等                       |
| Blu-ray・DVD、配信等                   |
| 20 作記念グッズ・東映 EC 商品          |
| 石ノ森章太郎生誕 80 周年記念商品       |
| 玩具・カード                           |
| 食品・飲料・菓子                       |
| 子供生活雑貨                           |
| アパレル・大人向け雑貨                 |
| フィギュア・ホビー・一番くじ・プライズ |
| ゲーム・デジタル                       |
| 雑誌・書籍・漫画                       |
| 音楽                                   |
| 映像                                   |
| イベント                               |
| ホテル・レストラン等                   |
| キャンペーン・タイアップ等             |
| その他                                 |
| KAMEN RIDER STORE                      |
| THE 鎧武祭り                           |
| 鎧武外伝                               |
| 仮面ライダーリバイス                   |
| ファイナルステージ                     |
| THE50 周年展                           |
| 風都探偵                               |
| 仮面ライダーギーツ                     |
| 仮面ライダーアウトサイダーズ           |
| 仮面ライダーガッチャード               |
| 仮面ライダー BLACK SUN                 |
| 仮面ライダーガヴ                       |
| ライドカメンズ                         |
| 仮面ライダーゼッツ                     |
| 仮面ライダーアギト                     |
| 仮面ライダーマイス                     |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = getRouteLimit(ctx, 50);

    const rootUrl = 'https://www.kamen-rider-official.com';
    const apiUrl = new URL('api/v1/news_articles', rootUrl).href;
    const currentPage = new URL('news_articles/', rootUrl);
    if (category) {
        currentPage.searchParams.set('category', category);
    }
    const currentUrl = currentPage.href;

    const { data: currentResponse } = await got(currentUrl);

    const buildId = currentResponse.match(/"buildId":"(.*?)"/)[1];

    const apiCategoryUrl = new URL(`_next/data/${buildId}/news_articles.json`, rootUrl).href;

    const { data: categoryResponse } = await got(apiCategoryUrl);

    const categoryIds = categoryResponse.pageProps.categoryIds;
    if (category && category !== 'すべて' && !Object.hasOwn(categoryIds, category)) {
        throw new InvalidParameterError(`Unknown news category: ${category}. Use a category name from the official news page.`);
    }
    const id = category && category !== 'すべて' ? categoryIds[category] : undefined;

    const { data: response } = await got(apiUrl, {
        searchParams: {
            category_id: id,
            limit,
            offset: 0,
        },
    });

    let items = response.news_articles.slice(0, limit).map((item): DataItem => ({
        title: item.list_title,
        link: new URL(item.path, rootUrl).href,
        description: renderDescription(
            item.list_image_path
                ? {
                      src: new URL(item.list_image_path, rootUrl).href,
                      alt: item.list_title,
                  }
                : undefined
        ),
        author: item.author,
        category: [item.category_name, item.category_2_name].filter(Boolean),
        guid: `kamen-rider-official-${item.id}`,
        pubDate: item.release_date ? parseDate(item.release_date) : undefined,
    }));

    items = await pMap<DataItem, DataItem>(
        items,
        async (item) => {
            const detail = await cache.tryGet(`kamen-rider-official:detail:${item.link}`, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('a.c-button').each((_, el) => {
                    content(el).parent().remove();
                });

                content('img').each((_, el) => {
                    content(el).replaceWith(
                        renderDescription({
                            src: content(el).prop('src'),
                        })
                    );
                });

                const title = content('h1.p-post__title').text();
                const description = content('main.p-post__main').html();
                const author = content('div.p-post__responsibility p')
                    .toArray()
                    .map((a) => content(a).text())
                    .join(' / ');
                const category = content('ul.p-post__categories li a.p-post__category')
                    .toArray()
                    .map((c) => content(c).text().trim())
                    .filter(Boolean);

                return { title, description, author, category };
            });
            return {
                ...item,
                ...detail,
                title: detail.title || item.title,
                category: [...new Set([...(Array.isArray(item.category) ? item.category : item.category ? [item.category] : []), ...detail.category])],
            };
        },
        { concurrency: 3 }
    );

    const $ = load(currentResponse);

    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;

    return {
        item: items,
        title: `${$('title').text().split(/ー/, 1)[0]}${category ? ` - ${category}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang') as Language,
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="keywords"]').prop('content'),
        author: $('meta[property="og:site_name"]').prop('content'),
    };
}
