import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import path from 'node:path';

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
  | 仮面ライダー BLACK SUN                 |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 50;

    const rootUrl = 'https://www.kamen-rider-official.com';
    const apiUrl = new URL('api/v1/news_articles', rootUrl).href;
    const currentUrl = new URL(`news_articles/${category ? `?category=${category}` : ''}`, rootUrl).href;

    const { data: currentResponse } = await got(currentUrl);

    const buildId = currentResponse.match(/"buildId":"(.*?)"/)[1];

    const apiCategoryUrl = new URL(`_next/data/${buildId}/news_articles.json`, rootUrl).href;

    const { data: categoryResponse } = await got(apiCategoryUrl);

    const id = categoryResponse.pageProps.categoryIds[category];

    const { data: response } = await got(apiUrl, {
        searchParams: {
            category_id: id,
            limit,
            offset: 0,
        },
    });

    let items = response.news_articles.slice(0, limit).map((item) => ({
        title: item.list_title,
        link: new URL(item.path, rootUrl).href,
        description: art(path.join(__dirname, 'templates/description.art'), {
            image: item.list_image_path
                ? {
                      src: new URL(item.list_image_path, rootUrl).href,
                      alt: item.list_title,
                  }
                : undefined,
        }),
        author: item.author,
        category: [item.category_name, item.category_2_name].filter(Boolean),
        guid: `kamen-rider-official-${item.id}`,
        pubDate: parseDate(item.release_date),
    }));

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                content('a.c-button').each(function () {
                    content(this).parent().remove();
                });

                content('img').each(function () {
                    content(this).replaceWith(
                        art(path.join(__dirname, 'templates/description.art'), {
                            image: {
                                src: content(this).prop('src'),
                            },
                        })
                    );
                });

                item.title = content('h1.p-post__title').text() || item.title;
                item.description = content('main.p-post__main').html();
                item.author = content('div.p-post__responsibility p')
                    .toArray()
                    .map((a) => content(a).text())
                    .join(' / ');
                item.category = [
                    ...new Set(
                        [
                            ...item.category,
                            ...content('ul.p-post__categories li a.p-post__category')
                                .toArray()
                                .map((c) => content(c).text().trim()),
                        ].filter(Boolean)
                    ),
                ];

                return item;
            })
        )
    );

    const $ = load(currentResponse);

    const icon = new URL($('link[rel="icon"]').prop('href'), rootUrl).href;

    return {
        item: items,
        title: `${$('title').text().split(/ー/)[0]}${category ? ` - ${category}` : ''}`,
        link: currentUrl,
        description: $('meta[property="og:description"]').prop('content'),
        language: $('html').prop('lang'),
        image: $('meta[property="og:image"]').prop('content'),
        icon,
        logo: icon,
        subtitle: $('meta[property="keywords"]').prop('content'),
        author: $('meta[property="og:site_name"]').prop('content'),
        allowEmpty: true,
    };
}
