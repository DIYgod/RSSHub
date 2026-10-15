import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

import { getArticle } from './article';

type PageDataItem = {
    tid: string;
    username: string;
    subject: string;
    dateline: string;
    type: string;
};

type PostType = 'home' | 'gold' | 'threadsearch' | 'search';

const isPostType = (type: string): type is PostType => ['home', 'gold', 'threadsearch', 'search'].includes(type);

export const route: Route = {
    path: '/:id?/:type?/:keyword?',
    url: 'cool18.com',
    example: '/cool18/bbs4',
    parameters: {
        id: 'the name of the bbs, use `global` for site-wide search',
        type: 'the type of the post. Can be `home`, `gold`, `threadsearch`. Default: `home`',
        keyword: 'the keyword to search.',
    },
    categories: ['bbs'],
    radar: ['bbs', 'bbs2', 'bbs3', 'bbs4', 'bbs5', 'bbs6', 'bbs7', 'bj'].map((id) => ({
        source: [`cool18.com/${id}/`, `cool18.com/${id}/index.php`],
        target: `/${id}`,
    })),
    name: '帖子',
    maintainers: ['nczitzk', 'Gabrlie'],
    handler,
    features: {
        nsfw: true,
    },
};

/**
 * Build the list request URL.
 */
function buildUrl(rootUrl: string, type: PostType, keyword: string | undefined, isGlobal: boolean): string {
    if (isGlobal && (type === 'search' || type === 'threadsearch')) {
        return `${rootUrl}/search.php?keyword=${encodeURIComponent(keyword || '')}&sa=全成人区搜索`;
    }

    const params = {
        home: '',
        gold: '?app=forum&act=gold',
        threadsearch: `?action=search&act=threadsearch&app=forum&keywords=${encodeURIComponent(keyword || '')}&submit=查询`,
        search: `?action=search&act=threadsearch&app=forum&keywords=${encodeURIComponent(keyword || '')}&submit=查询`,
    };

    return rootUrl + params[type];
}

/**
 * Extract posts from the homepage's JSON data.
 */
function extractHomeList($: CheerioAPI, rootUrl: string, limit: number): DataItem[] {
    try {
        const scriptText = $('script:contains("_PageData")').text();
        const match = scriptText.match(/const\s+_PageData\s*=\s*(\[[\s\S]*?\]);/);

        if (!match?.[1]) {
            return [];
        }

        const pageData: PageDataItem[] = JSON.parse(match[1]);

        return pageData.slice(0, limit).map((item) => {
            const subject = $('<div>').html(item.subject);
            subject.find('.list-type-show').remove();
            return {
                title: subject.text(),
                link: `${rootUrl}?app=forum&act=threadview&tid=${item.tid}`,
                pubDate: parseDate(item.dateline, 'MM/DD/YY'),
                author: item.username,
                category: item.type ? [item.type] : [],
                description: '',
            };
        });
    } catch {
        return [];
    }
}

/**
 * Extract posts from an HTML list.
 */
function extractHtmlList($: CheerioAPI, rootUrl: string, limit: number): DataItem[] {
    const selector = '#d_list ul li, #thread_list li, .t_l .t_subject, .post-list.thread-list li';
    const elements = $(selector);

    return elements
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a').first();
            const href = $link.attr('href') || '';

            const categoryText = $link.find('span').first().text().trim();

            const authorFromFont = $item.find('font[color="black"]').text().trim();
            const authorFromLink = $item.find('a').last().text().trim();
            const author = authorFromFont || authorFromLink;

            return {
                title: $link.text(),
                link: new URL(href, rootUrl).href,
                pubDate: parseDate($item.find('i').text(), 'MM/DD/YY'),
                author,
                category: categoryText ? [categoryText] : [],
                description: '',
            };
        })
        .filter((item) => item.link);
}

/**
 * Extract posts from site-wide search.
 */
function extractGlobalSearchList($: CheerioAPI, limit: number): DataItem[] {
    const selector = '.search-content ul li';
    const elements = $(selector);

    return elements
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a').first();
            const href = $link.attr('href') || '';

            const $pElements = $link.find('p');
            const category = $pElements
                .filter('.lf')
                .first()
                .text()
                .trim()
                .replaceAll(/[【】]/g, '');
            const title = $pElements.filter('.lf').eq(1).text();
            const dateText = $pElements.filter('.lr').text();

            return {
                title: title || $link.text(),
                link: href.startsWith('http') ? href : `https://www.cool18.com/${href}`,
                pubDate: parseDate(dateText, 'YYYY-MM-DD HH:mm'),
                author: '',
                category: category ? [category] : [],
                description: '',
            };
        })
        .filter((item) => item.link && item.title);
}

/**
 * Extract featured posts from the Gold page.
 */
function extractGoldList($: CheerioAPI, rootUrl: string, limit: number): DataItem[] {
    const selector = '.section .post-list .post-item';
    const elements = $(selector);

    return elements
        .slice(0, limit)
        .toArray()
        .map((item) => {
            const $item = $(item);
            const $link = $item.find('a').first();
            const href = $link.attr('href') || '';
            const title = $link.text();

            const cleanTitle = title.replace(/^\.\s+/, '');

            return {
                title: cleanTitle,
                link: new URL(href, rootUrl).href,
                pubDate: undefined,
                author: '',
                category: ['精华'],
                description: '',
            };
        })
        .filter((item) => item.link && item.title);
}

/**
 * Handle the requested board and post type.
 */
async function handler(ctx: Context) {
    const { id = 'bbs4', type = 'home', keyword } = ctx.req.param();
    if (!isPostType(type)) {
        throw new InvalidParameterError(`Invalid type: ${type}. Use home, gold, threadsearch or search.`);
    }
    const postType = type;
    const isGlobal = id === 'global';

    const rootUrl = isGlobal ? 'https://www.cool18.com' : `https://www.cool18.com/${id}/index.php`;
    const currentUrl = buildUrl(rootUrl, postType, keyword, isGlobal);

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const limit = getRouteLimit(ctx, 20);
    const candidateLimit = ctx.req.query('sorted') === 'false' ? limit : Math.max(20, limit);

    let list: DataItem[];

    if (isGlobal && (postType === 'search' || postType === 'threadsearch')) {
        list = extractGlobalSearchList($, candidateLimit);
    } else {
        switch (postType) {
            case 'home':
                list = extractHomeList($, rootUrl, candidateLimit);
                break;
            case 'gold':
                list = extractGoldList($, rootUrl, candidateLimit);
                break;
            case 'threadsearch':
            case 'search':
                list = extractHtmlList($, rootUrl, candidateLimit);
                break;
            default:
                list = extractHtmlList($, rootUrl, candidateLimit);
                break;
        }
    }

    const items = await pMap(list, getArticle, { concurrency: 3 });

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items.filter((item): item is DataItem => item !== undefined),
    };
}
