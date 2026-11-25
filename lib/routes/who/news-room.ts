import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/time';

type ArticleMetadata = {
    headline: string;
    datePublished: string;
    author: {
        name: string;
    };
};
function getArticleMetadata(content: CheerioAPI): ArticleMetadata {
    return JSON.parse(content('script[type="application/ld+json"]:contains("Article")').text().trim().replace(/;$/, ''));
}
async function getArticleDetails(item) {
    const detailResponse = await got({ method: 'get', url: item.link });
    const content = load(detailResponse.data);
    const tags = content('.sf-item-header-wrapper .sf-tags-list-item')
        .toArray()
        .map((element) => content(element).text());
    const article = getArticleMetadata(content);
    const body = content('.sf-detail-body-wrapper');
    if (!body.length) {
        throw new Error(`WHO article content not found: ${item.link}`);
    }
    return {
        ...item,
        title: article.headline,
        author: article.author.name,
        description: body.html(),
        category: tags.length ? tags : undefined,
        pubDate: parseDate(article.datePublished),
    };
}
export const route: Route = {
    path: '/news-room/:category?/:language?',
    categories: ['government'],
    example: '/who/news-room/feature-stories',
    parameters: { category: 'Category, see below, Feature stories by default', language: 'Language, see below, English by default' },
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
            source: ['who.int/news-room/:type'],
            target: '/news-room/:type',
        },
    ],
    name: 'Newsroom',
    maintainers: ['LogicJake', 'nczitzk'],
    handler,
    url: 'who.int/news',
    description: `Category

| Feature stories | Commentaries |
| --------------- | ------------ |
| feature-stories | commentaries |

Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};
async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'feature-stories';
    const language = ctx.req.param('language') ?? '';
    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language ? `${language}/` : ''}news-room/${category}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const $ = load(response.data);
    const $list = $('.list-view--item a');
    let list: any[];
    if ($list.length === 0) {
        const response = await got({
            method: 'get',
            url: `${rootUrl}/api/hubs/${category.replaceAll('-', '')}?sf_culture=${language || 'en'}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl&$top=30`,
        });
        list = response.data.value.map((item) => ({
            title: item.Title,
            link: `${currentUrl}/detail/${item.ItemDefaultUrl.replace(/^\/+/, '')}`,
            pubDate: parseDate(item.PublicationDateAndTime),
        }));
    } else {
        list = $list.toArray().map((item) => {
            const $item = $(item);
            const link = $item.attr('href');
            return {
                link: `${link!.startsWith('http') ? '' : rootUrl}${$item.attr('href')}`,
            };
        });
    }
    const items = await pMap(list, (item) => cache.tryGet(item.link, () => getArticleDetails(item)), { concurrency: 3 });
    return {
        title: `${$('meta[property="og:title"]').attr('content')} - WHO`,
        link: currentUrl,
        item: items,
    };
}
