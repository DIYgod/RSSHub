import { load } from 'cheerio';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

const categoriesConf = {
    hot: {
        articleSelector: '.carousel__list .carousel__item',
        titleExtractor: (e) => e.attr('title'),
    },
    editor: {
        articleSelector: '.list-container--featured .list-vertical__item',
        titleExtractor: (e) => e.find('.list-vertical__title').text(),
    },
    default: {
        articleSelector: '.list-container--index .list-vertical__item',
        titleExtractor: (e) => e.find('.list-vertical__title').text(),
    },
};

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
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    description: `| 首頁 | 編輯精選 | 熱門文章 |
| ---- | -------- | -------- |
|      | editor   | hot      |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category');
    if (category && !Object.hasOwn(categoriesConf, category)) {
        throw new InvalidParameterError('Unsupported category. Use editor or hot, or omit the category for the overview.');
    }

    const rootUrl = 'https://global.udn.com';
    const currentUrl = `${rootUrl}/global_vision/index`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    const getItems = (config) =>
        $(config.articleSelector)
            .toArray()
            .map((item) => {
                const a = $(item);
                const rawLink = a.attr('href')!.split('?', 1)[0];
                return {
                    title: config.titleExtractor(a),
                    link: rawLink.startsWith('http') ? rawLink : `${rootUrl}${rawLink}`,
                };
            });

    let items: Array<DataItem & { link: string }>;
    if (category) {
        const conf = categoriesConf[category];
        items = getItems(conf);
    } else {
        const defaultItems = getItems(categoriesConf.default);
        const hotItems = getItems(categoriesConf.hot);

        const combinedItems = [...hotItems, ...defaultItems];
        items = new Map(combinedItems.map((item) => [item.link, item])).values().toArray();
    }

    items = await pMap(
        items,
        async (item) => {
            const detail = await cache.tryGet(`udn:global:v3:${item.link}`, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = load(detailResponse.data);

                const author = content('.article-content__authors .article-content__authors-name').text();
                const publishedTime = content('meta[property="article:published_time"]').attr('content');
                const pubDate = publishedTime ? parseDate(publishedTime) : undefined;

                const mainImage = content('.article-content__focus').html();
                const articleBodyHtml = content('.article-content__editor')
                    .find('p, figure, h2, .video-container')
                    .toArray()
                    .map((e) => content.html(e))
                    .join('');

                return {
                    author,
                    pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
                    description: mainImage + articleBodyHtml,
                    category: content('meta[name="news_keywords"]').attr('content')!.split(','),
                };
            });
            return { ...item, ...detail };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
