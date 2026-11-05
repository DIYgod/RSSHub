import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language, Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/video/:category?',
    categories: ['finance'],
    example: '/cs/video/今日聚焦',
    parameters: { category: '分类，见下表，默认为今日聚焦' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '中证视频',
    description: `| 今日聚焦 | 传闻求证 | 高端访谈 | 投教课堂 | 直播汇 |
| -------- | -------- | -------- | -------- | ------ |`,
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx) {
    const { category = '今日聚焦' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 50);

    const rootUrl = 'https://video.cs.com.cn';
    const apiCategoryUrl = new URL('web/api/getCategory', rootUrl).href;
    const apiUrl = new URL('web/api/toSecondPage', rootUrl).href;

    const {
        data: { data: categoryResponse },
    } = await got.post(apiCategoryUrl);

    const categories = categoryResponse.map((c) => ({
        id: c.id,
        title: c.categoryTitle,
        image: c.categoryImg,
        sortType: c.categorySortType,
    }));

    const selected = categories.find((c) => c.title === category || String(c.id) === category);
    if (!selected) {
        throw new InvalidParameterError(`Unknown video category: ${category}. Use a category name or ID from ${rootUrl}.`);
    }

    const currentUrl = new URL(`list.html?title=${selected.title}&id=${selected.id}`, rootUrl).href;

    const {
        data: { records: response },
    } = await got.post(apiUrl, {
        json: {
            categorySortType: selected.sortType,
            id: selected.id,
            pageNum: 1,
            pageSize: limit,
        },
    });

    const items = response.slice(0, limit).map((item) => ({
        title: item.contentTitle,
        link: new URL(item.contentUrl, rootUrl).href,
        description: item.contentDetails,
        author: item.contentSource,
        pubDate: timezone(parseDate(item.contentDatetime), 8),
        updated: timezone(parseDate(item.updateDate), 8),
    }));

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = selected.image;
    const icon = new URL($('link[rel="icon"]').prop('href')!, rootUrl).href;

    return {
        item: items,
        title: `${title} | ${selected.title}`,
        link: currentUrl,
        description: $('meta[name="Description"]').prop('content'),
        language: $('html').prop('lang') as Language,
        image,
        icon,
        logo: icon,
        subtitle: $('meta[name="Keywords"]').prop('content'),
        author: title.split('-').pop()!.trim(),
    };
}
