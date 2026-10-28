import { load } from 'cheerio';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const CATEGORY_MAP = {
    domestic: 'domestic',
    international: 'international',
    social: 'social',
    news100: 'news100',
};

export const route: Route = {
    path: '/news/:category?',
    categories: ['new-media'],
    example: '/china/news',
    parameters: { category: 'Category of news. See the form below for details, default is china news.' },
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
            source: ['news.china.com/:category'],
        },
    ],
    name: 'News and current affairs 时事新闻',
    maintainers: ['jiaaoMario'],
    handler,
    description: `Category of news

| China News | International News | Social News | Breaking News |
| ---------- | ------------------ | ----------- | ------------- |
| domestic   | international      | social      | news100       |`,
};

async function handler(ctx) {
    const baseUrl = 'https://news.china.com';
    const requestedCategory = ctx.req.param('category') ?? 'domestic';
    if (!Object.hasOwn(CATEGORY_MAP, requestedCategory)) {
        throw new InvalidParameterError(`Unknown news category "${requestedCategory}". Use ${Object.keys(CATEGORY_MAP).join(', ')}.`);
    }
    const category = CATEGORY_MAP[requestedCategory];
    const websiteUrl = `${baseUrl}/${category}`;
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = load(data);
    const categoryTitle = $('.wp_title').text();
    const news = $('.item_list li');
    const entries = news.toArray().map((item): DataItem => {
        const $item = $(item);
        return {
            title: $item.find('.item_title a').text(),
            author: $item.find('.item_source').text(),
            category: `${categoryTitle}新闻`,
            pubDate: timezone(parseDate($item.find('.item_time').text()), 8),
            link: $item.find('li a').attr('href'),
        };
    });
    const items = await Promise.all(
        entries.map((entry) =>
            cache.tryGet(entry.link!, async () => {
                const { data: detail } = await got(entry.link!);
                const $$ = load(detail);
                const articleInfo = $$('.article_info, #chan_newsInfo').first();
                const articleDate = articleInfo.find('.time').text();
                return {
                    ...entry,
                    title: $$('h1').text() || entry.title,
                    description: $$('#js_article_content, #chan_newsDetail').first().html(),
                    pubDate: articleDate ? timezone(parseDate(articleDate), 8) : entry.pubDate,
                    author:
                        articleInfo
                            .find('.source')
                            .text()
                            .replace(/^来源：\s*/, '') || entry.author,
                };
            })
        )
    );
    return {
        title: `中华网-${categoryTitle}新闻`,
        link: websiteUrl,
        item: items,
    };
}
