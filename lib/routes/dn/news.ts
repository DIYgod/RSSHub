import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Language, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

import { renderDescription } from './templates/description';

export const route: Route = {
    path: '/:language/news/:category?',
    categories: ['new-media'],
    example: '/dn/en-us/news',
    parameters: { language: 'Language, see below', category: 'Category, see below, The Latest by default' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    description: `#### Language

| English | 中文  |
| ------- | ----- |
| en-us   | zh-cn |

#### Category

| English Category     | 中文分类 | Category id |
| -------------------- | -------- | ----------- |
| The Latest           | 最新     |             |
| Industry Information | 行业资讯 | category-1  |
| Knowledge            | 域名知识 | category-2  |
| Investment           | 域名投资 | category-3  |`,
};

async function handler(ctx) {
    const { language, category = '' } = ctx.req.param();
    if (!['en-us', 'zh-cn'].includes(language)) {
        throw new InvalidParameterError('Invalid language. Use en-us or zh-cn.');
    }
    if (category && !['category-1', 'category-2', 'category-3'].includes(category)) {
        throw new InvalidParameterError('Invalid category. Use category-1, category-2, or category-3, or omit it for the latest news.');
    }

    const limit = getRouteLimit(ctx, 10);

    const rootUrl = 'https://dn.com';
    const currentUrl = new URL(`/${language}/news/${category}`, rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    let items = $('.news-list-item, .news-lists > .list-item')
        .slice(0, limit)
        .toArray()
        .map((item): DataItem & { link: string; category: string[] } => {
            const $item = $(item);

            const image = $item.find('.news-item-cover img');

            return {
                title: $item.find('.news-item-title, .list-item-title').text(),
                link: new URL($item.find('.news-item-title, .list-item-title').attr('href')!, rootUrl).href,
                description: renderDescription({
                    image: image.length
                        ? {
                              src: image.prop('src')!,
                              alt: image.prop('alt'),
                          }
                        : undefined,
                    abstracts: $item.find('.news-item-desc, .list-item-desc').html() ?? undefined,
                }),
                category: $item
                    .find('.news-item-category, .list-item-category')
                    .toArray()
                    .map((c) => $(c).text()),
                pubDate: timezone(parseDate($item.find('.news-item-date, .list-item-date').text().trim(), language === 'en-us' ? 'DD MMM YYYY hh:mm:ss A' : 'YYYY-MM-DD HH:mm:ss', 'en'), 8),
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const { data: detailResponse } = await got(item.link);

                const content = load(detailResponse);

                item.title = content('.news-detail-title').text();
                item.description = content('.news-detail-content').html() ?? undefined;
                item.author = content('.news-detail-meta-item.author span')
                    .text()
                    .replace(/^(By|作者)[：:]\s*/, '');
                item.category = [
                    ...item.category,
                    ...content('.news-detail-tag')
                        .toArray()
                        .map((c) => content(c).text()),
                ];
                item.pubDate = timezone(parseDate(content('.news-detail-meta-item.date span').text().trim(), language === 'en-us' ? 'DD MMM YYYY hh:mm:ss A' : 'YYYY-MM-DD HH:mm:ss', 'en'), 8);

                return item;
            })
        )
    );

    const title = $('a.logo').attr('title') ?? 'DN.com';
    const iconPath = $('link[rel="icon"]').attr('href');
    const icon = iconPath ? new URL(iconPath, rootUrl).href : undefined;

    return {
        item: items,
        title: `${title} - ${$('.news-category-item.active').text()}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: $('html').prop('lang') as Language,
        icon,
        logo: icon,
        subtitle: $('title').text(),
        author: title,
    };
}
