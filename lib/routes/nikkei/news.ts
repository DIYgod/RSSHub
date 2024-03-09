import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export const route: Route = {
    path: '/:category/:article_type?',
    categories: ['traditional-media'],
    example: '/nikkei/news',
    parameters: { category: 'Category, see table below', article_type: 'Only includes free articles, set `free` to enable, disabled by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: {
        source: ['www.nikkei.com/:category/archive', 'www.nikkei.com/:category'],
        target: '/:category',
    },
    name: 'News',
    maintainers: ['Arracc'],
    handler,
    description: `| 総合 | オピニオン | 経済    | 政治     | 金融      | マーケット | ビジネス | マネーのまなび | テック     | 国際          | スポーツ | 社会・調査 | 地域  | 文化    | ライフスタイル |
  | ---- | ---------- | ------- | -------- | --------- | ---------- | -------- | -------------- | ---------- | ------------- | -------- | ---------- | ----- | ------- | -------------- |
  | news | opinion    | economy | politics | financial | business   | 不支持   | 不支持         | technology | international | sports   | society    | local | culture | lifestyle      |`,
};

async function handler(ctx) {
    const baseUrl = 'https://www.nikkei.com';
    const { category, article_type = 'paid' } = ctx.req.param();
    let url = '';
    url = category === 'news' ? `${baseUrl}/news/category/` : `${baseUrl}/${category}/archive/`;

    const response = await got(url);
    const data = response.data;
    const $ = load(data);

    let categoryName = '';
    const listSelector = $('div#CONTENTS_MAIN').children('div.m-miM09').not('.PRa');
    const paidSelector = 'span.m-iconMember';

    let list = listSelector.toArray().map((item) => {
        item = $(item);
        item.find('p a').remove();
        return {
            title: item.find('.m-miM09_titleL').text(),
            link: `${baseUrl}${item.find('.m-miM09_title a').attr('href')}`,
            image: item.find('.m-miM09_thumb img').removeAttr('style').removeAttr('width').removeAttr('height').parent().html(),
            category: item
                .find('.m-miM09_keyword a')
                .toArray()
                .map((item) => $(item).text()),
            paywall: !!item.find(paidSelector).length,
        };
    });

    if (category === 'news') {
        categoryName = '総合';
        list = [
            ...list,
            ...$('div#CONTENTS_MAIN .m-miM32_itemTitle')
                .toArray()
                .map((item) => {
                    item = $(item);
                    const a = item.find('a').first();
                    return {
                        title: a.text(),
                        link: `${baseUrl}${a.attr('href')}`,
                        category: item
                            .find('.m-miM32_itemkeyword a')
                            .toArray()
                            .map((item) => $(item).text()),
                        paywall: !!item.find(paidSelector).length,
                    };
                }),
        ];
    } else {
        categoryName = $('h1.l-miH11_title').text().trim();
    }

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = load(response);

                $('.notFloated_n1oadkwi').remove();

                item.pubDate = parseDate($('meta[property="article:published_time"]').attr('content'));
                item.description = art(path.join(__dirname, 'templates/news.art'), {
                    item,
                    description: $('section[class^=container_]').html(),
                });

                return item;
            })
        )
    );

    return {
        title: '日本経済新聞 - ' + categoryName,
        description: $('meta[name="description"]').attr('content'),
        link: url,
        image: $('meta[property="og:image"]').attr('content'),
        language: 'ja',
        item: article_type === 'free' ? items.filter((item) => !item.paywall) : items,
    };
}
