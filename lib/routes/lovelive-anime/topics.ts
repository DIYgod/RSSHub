import { Route } from '@/types';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
import path from 'node:path';
import { art } from '@/utils/render';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
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
    const { abbr, category = '', option } = ctx.req.param();
    let rootUrl: string;
    switch (abbr) {
        case 'musical':
            rootUrl = 'https://www.lovelive-anime.jp/special/musical';
            break;
        default:
            rootUrl = `https://www.lovelive-anime.jp/${abbr}`;
            break;
    }
    const topicsTable = {
        otonokizaka: 'topics.php',
        uranohoshi: 'topics.php',
        nijigasaki: 'topics.php',
        yuigaoka: 'topics/',
        hasunosora: 'news/',
        musical: 'topics.php',
    };
    const baseUrl = `${rootUrl}/${topicsTable[abbr]}`;
    const abbrDetail = {
        otonokizaka: 'ラブライブ！',
        uranohoshi: 'サンシャイン!!',
        nijigasaki: '虹ヶ咲学園',
        yuigaoka: 'スーパースター!!',
    };

    const url = category !== '' && category !== 'detail' ? `${baseUrl}?cat=${category}` : baseUrl;

    const response = await ofetch(url);

    const $ = load(response);

    const categoryName = 'uranohoshi' === abbr ? $('div.llbox > p').text() : $('div.category_title > h2').text();

    const newsList = 'hasunosora' === abbr ? $('.list__content > ul > li').toArray() : $('ul.listbox > li').toArray();
    let items;

    switch (abbr) {
        case 'hasunosora':
            items = newsList.map((item) => {
                item = $(item);
                const link = `${rootUrl}/news/${item.find('a').attr('href')}`;
                const pubDate = timezone(parseDate(item.find('.list--date').text(), 'YYYY.MM.DD'), +9);
                const title = item.find('.list--text').text();
                const category = item.find('.list--category').text();

                return {
                    link,
                    pubDate,
                    title,
                    category,
                    description: title,
                };
            });
            break;
        default:
            items = newsList.map((item) => {
                item = $(item);
                let link: string;
                switch (abbr) {
                    case 'yuigaoka':
                        link = `${baseUrl}${item.find('div > a').attr('href')}`;
                        break;
                    default:
                        link = `${rootUrl}/${item.find('div > a').attr('href')}`;
                        break;
                }
                const pubDate = timezone(parseDate(item.find('a > p.date').text(), 'YYYY/MM/DD'), +9);
                const title = item.find('a > p.title').text();
                const category = item.find('a > p.category').text();
                const imglink = `${rootUrl}/${
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
                        imglink,
                    }),
                };
            });
            break;
    }

    if (option === 'detail' || category === 'detail') {
        items = await Promise.all(
            items.map((item) =>
                cache.tryGet(item.link, async () => {
                    const detailResp = await ofetch(item.link);
                    const $ = load(detailResp);
                    let content;
                    switch (abbr) {
                        case 'hasunosora':
                            content = $('div.detail__content');
                            break;
                        default:
                            content = $('div.p-page__detail.p-article');
                            break;
                    }
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
