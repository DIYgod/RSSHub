import { type CheerioAPI, load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

type ArticleMetadata = { '@type'?: string; headline?: string; dateModified?: string; author?: { name?: string } };

function parseArticleByline(text: string): { author: string; credit?: string } | undefined {
    const editor = text.match(/^編輯／([\p{Script=Han}、\s]{1,40})$/u);
    const reporter = text.match(/^\p{Script=Han}{1,8}／\s*([\p{Script=Han}、][\p{Script=Han}、\s]{0,39}?)\s+編輯／[\p{Script=Han}、\s]{1,40}$/u);
    if (editor || reporter) {
        const author = (reporter?.[1] || editor?.[1])?.replace(/\s+編撰$/, '').trim();
        return author ? { author } : undefined;
    }
    const photoByline = text.match(/^（記者([\p{Script=Han}、\s]{1,40})、圖片來源：([^（）\n]+)）$/u);
    if (photoByline) {
        return { author: photoByline[1].trim(), credit: `（圖片來源：${photoByline[2]}）` };
    }
    const syndicatedByline = text.match(/^（常春月刊／編輯部整理、文章授權提供／([^、（）\n]+)、圖片來源：([^（）\n]+)）$/);
    if (syndicatedByline) {
        return { author: '常春月刊編輯部', credit: `（文章授權提供／${syndicatedByline[1]}、圖片來源：${syndicatedByline[2]}）` };
    }
}

function getArticleMetadata(content: CheerioAPI): ArticleMetadata | undefined {
    for (const element of content('script[type="application/ld+json"]').toArray()) {
        try {
            const metadata: ArticleMetadata = JSON.parse(content(element).text());
            if (metadata['@type'] === 'NewsArticle') {
                return metadata;
            }
        } catch {
            // Ignore malformed structured data and retain available HTML metadata.
        }
    }
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
    const publishedTime = content('meta[property="article:published_time"]').attr('content');
    const category = content('div.article-body ul.tag')
        .find('a')
        .toArray()
        .map((t) => content(t).text());
    const section = content("meta[property='article:section']").attr('content');
    if (section && !category.includes(section)) {
        category.push(section);
    }

    return {
        title: metadata?.headline || content('h1').text() || content('title').text(),
        pubDate: publishedTime ? parseDate(publishedTime) : undefined,
        updated: metadata?.dateModified ? parseDate(metadata.dateModified) : undefined,
        category,
        description: main.html() || undefined,
        author: author || metadata?.author?.name,
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
        .filter((item) => $(item).find('a').attr('href'))
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
                category: Array.isArray(details.category) ? details.category.filter((category) => typeof category === 'string') : details.category,
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
