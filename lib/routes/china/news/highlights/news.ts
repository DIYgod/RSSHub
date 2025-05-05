import { Route } from '@/types';
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    const category = CATEGORY_MAP[ctx.req.param('category')] ?? CATEGORY_MAP.domestic;
    const websiteUrl = `${baseUrl}/${category}`;
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = load(data);
    const categoryTitle = $('.wp_title').text();
    const news = $('.item_list li');
    return {
        title: `中华网-${categoryTitle}新闻`,
        link: websiteUrl,
        item: news.toArray().map((item) => {
            item = $(item);
            return {
                title: item.find('.item_title a').text(),
                author: item.find('.item_source').text(),
                category: `${categoryTitle}新闻`,
                pubDate: parseDate(item.find('.item_time').text()),
                description: item.find('.item_title a').text(),
                link: item.find('li a').attr('href'),
            };
        }),
    };
}
