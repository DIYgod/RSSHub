import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

type ArticleMetadata = { '@type': string; headline: string; dateModified: string; author: { name: string } };

function parseArticleByline(text: string): { author: string; credit?: string } | undefined {
    const editor = /^編輯／([\p{Script=Han}、\s]{1,40})$/u.exec(text);
    const reporter = /^\p{Script=Han}{1,8}／\s*([\p{Script=Han}、][\p{Script=Han}、\s]{0,39}?)\s+編輯／[\p{Script=Han}、\s]{1,40}$/u.exec(text);
    if (editor || reporter) {
        const author = (reporter?.[1] || editor?.[1])?.replace(/\s+編撰$/, '').trim();
        return author ? { author } : undefined;
    }
    const photoByline = /^（記者([\p{Script=Han}、\s]{1,40})、圖片來源：([^（）\n]+)）$/u.exec(text);
    if (photoByline) {
        return { author: photoByline[1].trim(), credit: `（圖片來源：${photoByline[2]}）` };
    }
    const syndicatedByline = /^（常春月刊／編輯部整理、文章授權提供／([^、（）\n]+)、圖片來源：([^（）\n]+)）$/.exec(text);
    if (syndicatedByline) {
        return { author: '常春月刊編輯部', credit: `（文章授權提供／${syndicatedByline[1]}、圖片來源：${syndicatedByline[2]}）` };
    }
}

function getArticleMetadata(content: CheerioAPI): ArticleMetadata {
    return JSON.parse(content('script[type="application/ld+json"]:contains("NewsArticle")').text());
}

async function fetchArticleDetails(link: string): Promise<Pick<DataItem, 'title' | 'pubDate' | 'updated' | 'category' | 'description' | 'author'>> {
    const detailResponse = await got({ method: 'get', url: link });
    const content = load(detailResponse.data);
    const metadata = getArticleMetadata(content);
    const main = content('#newscontent');
    let author: string | undefined;
    main.find('p').each((_, element) => {
        const paragraph = content(element);
        const byline = parseArticleByline(paragraph.text().trim());
        if (!byline) {
            return;
        }

        author ||= byline.author;
        if (byline.credit) {
            paragraph.text(byline.credit);
        } else {
            paragraph.remove();
        }
    });
    const tags = content('div.article-body ul.tag')
        .find('a')
        .toArray()
        .map((t) => content(t).text());
    const section = content("meta[property='article:section']").attr('content');
    const category = section && !tags.includes(section) ? [...tags, section] : tags;

    return {
        title: metadata.headline,
        pubDate: parseDate(content('meta[property="article:published_time"]').attr('content')!),
        updated: parseDate(metadata.dateModified),
        category,
        description: main.html(),
        author: author || metadata.author.name,
    };
}

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/ttv',
    parameters: { category: '分类' },
    name: '分类',
    maintainers: ['dzx-dzx'],
    radar: [
        {
            source: ['news.ttv.com.tw/'],
            target: '/',
        },
        {
            source: ['news.ttv.com.tw/realtime'],
            target: '/realtime',
        },
        {
            source: ['news.ttv.com.tw/focus'],
            target: '/focus',
        },
        {
            source: ['news.ttv.com.tw/category/:category'],
            target: '/:category',
        },
    ],
    handler,
};

async function handler(ctx) {
    const rootUrl = 'https://news.ttv.com.tw';
    const category = ctx.req.param('category') ?? 'realtime';
    const currentUrl = `${rootUrl}/${['realtime', 'focus'].includes(category) ? category : `category/${category}`}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = load(response.data);

    let items = $('div.news-list li')
        .slice(0, getRouteLimit(ctx, 30))
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);

            return {
                link: new URL($item.find('a').attr('href')!, currentUrl).href,
                title: '',
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const details = await cache.tryGet(`ttv:detail:v3:${item.link}`, () => fetchArticleDetails(item.link!));
            return {
                ...item,
                title: details.title,
                pubDate: details.pubDate,
                updated: details.updated,
                author: details.author,
                category: details.category,
                description: details.description,
            };
        },
        { concurrency: 3, stopOnError: false }
    );

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
