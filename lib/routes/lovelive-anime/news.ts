import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

export const route: Route = {
    path: '/news/:abbr?/:category?/:option?',
    categories: ['anime'],
    example: '/lovelive-anime/news',
    parameters: {
        abbr: 'The path to the Love Live series of sub-projects on the official website is detailed in the table below, `abbr` is `detail` when crawling the full text',
        category: 'The official website lists the Topics category, `category` is `detail` when crawling the full text, other categories see the following table for details',
        option: 'Crawl full text when `option` is `detail`.',
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
            source: ['www.lovelive-anime.jp/news/?series=:abbr&subcategory=:category', 'www.lovelive-anime.jp/news/?series=:abbr', 'www.lovelive-anime.jp/news/', 'www.lovelive-anime.jp/'],
            target: '/news/:abbr?/:category?',
        },
    ],
    name: 'News',
    maintainers: ['axojhf', 'zhaoweizhong'],
    handler,
    url: 'www.lovelive-anime.jp/',
    description: `| Sub-project Name | All Projects | Lovelive!   | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | 蓮ノ空女学院 | 幻日のヨハネ | ラブライブ！スクールアイドルミュージカル |
  | -------------------------------- | -------------- | ----------- | -------------------- | ------------------------------------------ | --------------------- | ------------ | ------------ | ---------------------------------------- |
  | \`abbr\`parameter                  | <u>*No parameter*</u> | lovelive |     sunshine        | nijigasaki                                 | superstar              | hasunosora | yohane       | musical                                  |

  | Category Name       | 全てのニュース        | 音楽商品 | アニメ映像商品 | キャスト映像商品 | 劇場    | アニメ放送 / 配信 | キャスト配信 / ラジオ | ライブ / イベント | ブック | グッズ | ゲーム | メディア | ご当地情報 | キャンペーン | その他 |
  | ------------------- | --------------------- | -------- | -------------- | ---------------- | ------- | ----------------- | --------------------- | ----------------- | ------ | ------ | ------ | -------- | ---------- | ------ | ------------ |
  | \`category\`parameter | <u>*No parameter*</u> | music    | anime_movie   | cast_movie      | theater | onair             | radio                 | event             | books  | goods  | game   | media    | local      | campaign  | other   |`,
};

async function handler(ctx) {
    let url = 'https://www.lovelive-anime.jp/news/';
    const abbr = ctx.req.param('abbr');
    const category = ctx.req.param('category');
    const option = ctx.req.param('option');

    const isDetail = abbr === 'detail' || category === 'detail' || option === 'detail';

    const params = new URLSearchParams();
    if (abbr && abbr !== 'detail') {
        params.append('series', abbr);
        if (category && category !== 'detail') {
            params.append('subcategory', category);
        }
    }
    url += `?${params.toString()}`;

    const response = await got(url);

    const $ = load(response.data);

    const pageFace = $('div.c-card.p-colum__box')
        .map((_, item) => {
            item = $(item);

            return {
                link: item.find('a.c-card__head').attr('href'),
                pubDate: timezone(parseDate(item.find('span.c-card__date').text()), +9),
                title: item.find('div.c-card__title').text(),
                // description: `${item.find('div.c-card__title').text()}<br><img src="${item.find('a.c-card__head > div > figure > img').attr('src')}">`
                description: renderDescription({
                    title: item.find('div.c-card__title').text(),
                    imglink: item.find('a.c-card__head > div > figure > img').attr('src'),
                }),
            };
        })
        .get();

    let items = pageFace;

    if (isDetail) {
        items = await Promise.all(
            pageFace.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResp = await got(item.link);
                    const $ = load(detailResp.data);

                    const content = $('div.p-page__detail.p-article');
                    for (const v of content.find('img')) {
                        v.attribs.src = 'https://www.lovelive-anime.jp' + v.attribs.src;
                    }
                    item.description = content.html();
                    return item;
                })
            )
        );
    }

    return {
        title: 'lovelive official website news',
        link: 'https://www.lovelive-anime.jp/news/',
        item: items,
    };
}
