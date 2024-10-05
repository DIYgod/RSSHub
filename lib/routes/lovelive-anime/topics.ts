import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

export const route: Route = {
    path: '/topics/:abbr/:category?/:option?',
    categories: ['anime'],
    example: '/lovelive-anime/topics/otonokizaka',
    parameters: {
        abbr: 'The path to the Love Live series of sub-projects on the official website is detailed in the table below',
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
    name: 'Categories Topics',
    maintainers: ['axojhf'],
    handler,
    description: `| Sub-project Name (not full name) | Lovelive!   | Lovelive! Sunshine!! | Lovelive! Nijigasaki High School Idol Club | Lovelive! Superstar!! | 幻日のヨハネ | ラブライブ！スクールアイドルミュージカル |
  | -------------------------------- | ----------- | -------------------- | ------------------------------------------ | --------------------- | ------------ | ---------------------------------------- |
  | \`abbr\`parameter                  | otonokizaka | uranohoshi           | nijigasaki                                 | yuigaoka              | yohane       | musical                                  |

  | Category Name       | 全てのニュース        | 音楽商品 | アニメ映像商品 | キャスト映像商品 | 劇場    | アニメ放送 / 配信 | キャスト配信 / ラジオ | ライブ / イベント | ブック | グッズ | ゲーム | メディア | ご当地情報 | その他 | キャンペーン |
  | ------------------- | --------------------- | -------- | -------------- | ---------------- | ------- | ----------------- | --------------------- | ----------------- | ------ | ------ | ------ | -------- | ---------- | ------ | ------------ |
  | \`category\`parameter | <u>*No parameter*</u> | music    | anime\_movie   | cast\_movie      | theater | onair             | radio                 | event             | books  | goods  | game   | media    | local      | other  | campaign     |`,
};

async function handler(ctx) {
    const abbr = ctx.req.param('abbr');
    const rootUrl = `https://www.lovelive-anime.jp/${abbr}`;
    const topicsUrlPart = 'yuigaoka' === abbr ? 'topics/' : 'topics.php';
    const baseUrl = `${rootUrl}/${'yuigaoka' === abbr ? 'topics/' : ''}`;
    const abbrDetail = {
        otonokizaka: 'ラブライブ！',
        uranohoshi: 'サンシャイン!!',
        nijigasaki: '虹ヶ咲学園',
        yuigaoka: 'スーパースター!!',
    };

    const url = Object.hasOwn(ctx.params, 'category') && ctx.req.param('category') !== 'detail' ? `${rootUrl}/${topicsUrlPart}?cat=${ctx.req.param('category')}` : `${rootUrl}/${topicsUrlPart}`;

    const response = await got(url);

    const $ = load(response.data);

    const categoryName = 'uranohoshi' === abbr ? $('div.llbox > p').text() : $('div.category_title > h2').text();

    let items = $('ul.listbox > li')
        .map((_, item) => {
            item = $(item);

            const link = `${baseUrl}${item.find('div > a').attr('href')}`;
            const pubDate = parseDate(item.find('a > p.date').text(), 'YYYY/MM/DD');
            const title = item.find('a > p.title').text();
            const category = item.find('a > p.category').text();
            const imglink = `${baseUrl}${
                item
                    .find('a > img')
                    .attr('style')
                    .match(/background-image:url\((.*)\)/)[1]
            }`;

            return {
                link,
                pubDate,
                title,
                category,
                description: renderDescription({
                    title,
                    imglink,
                }),
            };
        })
        .get();

    if (ctx.req.param('option') === 'detail' || ctx.req.param('category') === 'detail') {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResp = await got(item.link);
                    const $ = load(detailResp.data);

                    const content = $('div.p-page__detail.p-article');
                    for (const v of content.find('img')) {
                        v.attribs.src = `${baseUrl}${v.attribs.src}`;
                    }
                    item.description = content.html();
                    return item;
                })
            )
        );
    }

    return {
        title: `${categoryName} - ${abbrDetail[abbr]} - Love Live Official Website Topics`,
        link: url,
        item: items,
    };
}
