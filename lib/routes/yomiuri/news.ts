import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/yomiuri/news',
    parameters: { category: 'Category, `news` by default' },
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
            source: ['www.yomiuri.co.jp/:category?'],
        },
    ],
    name: 'News',
    maintainers: ['Arracc'],
    handler,
    description: `Free articles only.

| Category       | Parameter |
| -------------- | --------- |
| 新着・速報     | news      |
| 社会           | national  |
| 政治           | politics  |
| 経済           | economy   |
| スポーツ       | sports    |
| 国際           | world     |
| 地域           | local     |
| 科学・ＩＴ     | science   |
| エンタメ・文化 | culture   |
| ライフ         | life      |
| 医療・健康     | medical   |
| 教育・就活     | kyoiku    |
| 選挙・世論調査 | election  |
| 囲碁・将棋     | igoshougi |
| 社説           | editorial |
| 皇室           | koushitsu |`,
};

async function handler(ctx) {
    const { category = 'news' } = ctx.req.param();
    const url = `https://www.yomiuri.co.jp/${category}`;

    const response = await got(url);
    const data = response.data;
    const $ = load(data);

    let list;
    const rootUrl = 'https://www.yomiuri.co.jp';
    if (category === 'news') {
        list = $('.news-top-latest__list .news-top-latest__list-item__inner')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('h3 a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), rootUrl).href,
                    pubDate: timezone(parseDate(item.find('time').attr('datetime')), +9),
                    locked: item.find('.icon-locked').length,
                };
            });
    } else {
        list = $('.p-category-organization .list .item')
            .toArray()
            .map((item) => {
                item = $(item);
                const a = item.find('h3.title a');
                return {
                    title: a.text(),
                    link: new URL(a.attr('href'), rootUrl).href,
                    pubDate: timezone(parseDate(item.find('.info time').attr('datetime')), +9),
                    locked: item.find('.c-list-member-only').length,
                };
            });
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                if (item.locked) {
                    return item;
                }

                const response = await got(item.link);
                const $ = load(response.data);
                const mainContent = $('.p-main-contents');

                mainContent.find('[class^=ev-article], svg').remove();
                mainContent.find('img').each((_, img) => {
                    img.attribs.src = img.attribs.src.split('?')[0];
                });

                item.description = mainContent.html();
                item.pubDate = parseDate($('meta[property="article:published_time"]').attr('content')); // 2023-05-17T22:33:00+09:00
                item.updated = parseDate($('meta[property="article:modified_time"]').attr('content'));

                const tag = $('.p-header-category__breadcrumbs li a').last().text();
                item.category = tag;
                item.title = `[${tag}] ${item.title}`;
                return item;
            })
        )
    );

    return {
        title: $('head title').text(),
        link: url,
        image: 'https://www.yomiuri.co.jp/apple-touch-icon.png',
        item: items,
    };
}
