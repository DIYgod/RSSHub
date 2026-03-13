import { load } from 'cheerio';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/global/:category?',
    categories: ['traditional-media'],
    example: '/udn/global',
    parameters: { category: '分类，见下表，默认为首頁' },
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
            source: ['global.udn.com/global_vision/index', 'global.udn.com/'],
        },
    ],
    name: '轉角國際 - 首頁',
    maintainers: ['nczitzk'],
    handler,
    description: `| 首頁 | 編輯精選 | 熱門文章 |
| ---- | -------- | -------- |
|      | editor   | hot      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');

    const rootUrl = 'https://global.udn.com';
    const currentUrl = `${rootUrl}/global_vision/index`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const categoriesConf = {
        hot: {
            articleSelector: '.carousel__list .carousel__item',
            titleExtractor: (e) => e.attr('title').trim(),
        },
        editor: {
            articleSelector: '.list-container--featured .list-vertical__item',
            titleExtractor: (e) => e.find('.list-vertical__title').text().trim(),
        },
        default: {
            articleSelector: '.list-container--index .list-vertical__item',
            titleExtractor: (e) => e.find('.list-vertical__title').text().trim(),
        },
    };
    const getItems = (config) =>
        $(config.articleSelector)
            .toArray()
            .map((item) => {
                const a = $(item);
                const rawLink = a.attr('href').split('?')[0];
                return {
                    title: config.titleExtractor(a),
                    link: rawLink.startsWith('http') ? rawLink : `${rootUrl}${rawLink}`,
                };
            });

    let items;
    if (category) {
        const conf = categoriesConf[category];
        items = getItems(conf);
    } else {
        const defaultItems = getItems(categoriesConf.default);
        const hotItems = getItems(categoriesConf.hot);

        const combinedItems = [...hotItems, ...defaultItems];
        items = [...new Map(combinedItems.map((item) => [item.link, item])).values()];
    }

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                item.author = content('.article-content__authors-name').first().text().trim();
                item.pubDate = timezone(parseDate(content('meta[property="article:published_time"]').attr('content')), +8);

                const mainImage = content('.article-content__focus').html();
                const articleBodyHtml = content('.article-content__editor')
                    .find('p, figure, h2, .video-container')
                    .toArray()
                    .map((e) => content.html(e))
                    .join('');

                item.description = mainImage + articleBodyHtml;
                item.category = content('meta[name="news_keywords"]').attr('content').split(',');

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
