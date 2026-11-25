import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

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

function resolveLink(href: string | undefined, baseUrl: string) {
    if (!href) {
        return;
    }
    try {
        const link = new URL(href, baseUrl);
        if (link.protocol === 'http:' || link.protocol === 'https:') {
            return link.href;
        }
    } catch {
        return;
    }
}

async function handler(ctx) {
    const { category = 'news' } = ctx.req.param();
    const url = `https://www.yomiuri.co.jp/${category}`;

    const response = await got(url);
    const data = response.data;
    const $ = load(data);

    let list;
    if (category === 'news') {
        list = $('.news-top-latest__list .news-top-latest__list-item__inner')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('h3 a');
                return {
                    title: a.text(),
                    link: `https://www.yomiuri.co.jp${a.attr('href')}`,
                    pubDate: parseDate($item.find('time').attr('datetime')!, 9),
                    locked: $item.find('.icon-locked').length,
                };
            });
    } else {
        $('.p-category-reading-recommend').remove();
        list = $('.layout-contents__main .c-list-title')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('h3 a');
                const parent = $item.parent();
                return {
                    title: a.text(),
                    link: resolveLink(a.attr('href'), url),
                    pubDate: parseDate(parent.find('time').attr('datetime')!, 9),
                    locked: parent.find('.c-list-member-only').length,
                };
            })
            .filter((item) => item.link);
    }

    const items = await pMap(
        list,
        async (entry: DataItem & { link: string; locked: number }) => {
            const { locked, ...item } = entry;
            if (locked) {
                return item;
            }

            const article = await cache.tryGet(`yomiuri:article:v6:${item.link}`, async () => {
                const response = await got(item.link);
                const $ = load(response.data);
                const mainContent = $('.p-main-contents');
                const author = $('.article-author__item')
                    .toArray()
                    .map((author) => ({ name: $(author).text().trim() }))
                    .filter((author) => author.name);

                mainContent.find('[class^=ev-article], svg, .article-author, .p-ad-dfp-premiumrec, .p-article-google-news, .article-related-link, .article-news-links, .article-schedule-link, .c-square-arrow-btn').remove();

                return {
                    description: mainContent.html(),
                    author: author.length ? author : undefined,
                    pubDate: parseDate($('meta[property="article:published_time"]').attr('content')!),
                    updated: parseDate($('meta[property="article:modified_time"]').attr('content')!),
                    category: $('.p-header-category__breadcrumbs li a').last().text(),
                };
            });
            return { ...item, ...article, title: `[${article.category}] ${item.title}` };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('head title').text(),
        link: url,
        image: 'https://www.yomiuri.co.jp/apple-touch-icon.png',
        item: items,
    };
}
