import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import ofetch from '@/utils/ofetch';
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
            source: ['www.lovelive-anime.jp/', 'www.lovelive-anime.jp/news/'],
            target: '/news',
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
    const abbr = ctx.req.param('abbr');
    const category = ctx.req.param('category');
    const option = ctx.req.param('option');

    const isDetail = abbr === 'detail' || category === 'detail' || option === 'detail';
    let series = '';
    let subcategory = '';

    if (abbr && abbr !== 'detail') {
        series = abbr;
        if (category && category !== 'detail') {
            subcategory = category;
        }
    }

    const limit = 20;

    let url = `https://www.lovelive-anime.jp/common/api/article_list.php?site=jp&ip=lovelive&limit=${limit}&data=`;
    const params: { category: string[]; series?: string[]; subcategory?: string[] } = { category: ['NEWS'] };
    if (series) {
        params.series = [series];
    }
    if (subcategory) {
        params.subcategory = [subcategory];
    }
    url += encodeURIComponent(JSON.stringify(params));

    const data = await ofetch(url);

    const articles = data.data.article_list.map((item) => ({
        title: item.title,
        link: item.url,
        description: renderDescription({
            imglink: 'https://www.lovelive-anime.jp' + item.thumbnail,
        }),
        pubDate: timezone(parseDate(item.dspdate), +9),
        category: item.categories.subcategory.map((category) => category.name),
    }));

    let items = articles;

    if (isDetail) {
        items = await Promise.all(
            articles.map((item) =>
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
