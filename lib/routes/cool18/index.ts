import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

type PageDataItem = {
    tid: string;
    username: string;
    subject: string;
    dateline: string;
    type: string;
};

type PostType = 'home' | 'gold' | 'threadsearch' | 'search';

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
    radar: [
        {
            source: ['cool18.com/:id/'],
            target: '/:id/:type?/:keyword?',
        },
    ],
    name: '禁忌书屋',
    maintainers: ['nczitzk', 'Gabrlie'],
    handler,
    features: {
        nsfw: true,
    },
};

/**
 * 构建请求 URL
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
 * 从首页 JSON 数据中提取列表
 */
function extractHomeList($: CheerioAPI, rootUrl: string, limit: number): DataItem[] {
    try {
        const scriptText = $('script:contains("_PageData")').text();
        const match = scriptText.match(/const\s+_PageData\s*=\s*(\[[\s\S]*?]);/);

        if (!match?.[1]) {
            return [];
        }

        const pageData: PageDataItem[] = JSON.parse(match[1]);

        return pageData.slice(0, limit).map((item) => ({
            title: item.subject,
            link: `${rootUrl}?app=forum&act=threadview&tid=${item.tid}`,
            pubDate: parseDate(item.dateline, 'MM/DD/YY'),
            author: item.username,
            category: item.type ? [item.type] : [],
            description: '',
        }));
    } catch {
        return [];
    }
}

/**
 * 从 HTML 列表中提取数据
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
                title: $link.text().trim(),
                link: href.startsWith('http') ? href : `${rootUrl}/${href}`,
                pubDate: parseDate($item.find('i').text(), 'MM/DD/YY'),
                author,
                category: categoryText ? [categoryText] : [],
                description: '',
            };
        })
        .filter((item) => item.link);
}

/**
 * 从全局搜索页面提取数据
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
            const title = $pElements.filter('.lf').eq(1).text().trim();
            const dateText = $pElements.filter('.lr').text().trim();

            return {
                title: title || $link.text().trim(),
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
 * 从 gold 页面提取精华帖子列表
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
            const title = $link.text().trim();

            const cleanTitle = title.replace(/^\.\s+/, '');

            return {
                title: cleanTitle,
                link: href.startsWith('http') ? href : `${rootUrl}/${href}`,
                pubDate: undefined,
                author: '',
                category: ['精华'],
                description: '',
            };
        })
        .filter((item) => item.link && item.title);
}

/**
 * 获取文章详情内容
 */
async function fetchArticleDetail(item: DataItem): Promise<DataItem> {
    if (!item.link) {
        return item;
    }

    return await cache.tryGet(item.link, async () => {
        const detailResponse = await ofetch(item.link!);
        const content = load(detailResponse);
        const preElement = content('pre');

        if (preElement.length > 0) {
            const htmlContent = preElement.html();
            if (htmlContent) {
                item.description = htmlContent.replaceAll('<font color="#E6E6DD">cool18.com</font>', '');
            }
        }

        return item;
    });
}

/**
 * 主处理函数
 */
async function handler(ctx: Context) {
    const { id = 'bbs4', type = 'home', keyword } = ctx.req.param();
    const postType = type as PostType;
    const isGlobal = id === 'global';

    const rootUrl = isGlobal ? 'https://www.cool18.com' : `https://www.cool18.com/${id}/index.php`;
    const currentUrl = buildUrl(rootUrl, postType, keyword, isGlobal);

    const response = await ofetch(currentUrl);
    const $ = load(response);

    const limitQuery = ctx.req.query('limit');
    const limit = limitQuery ? Number.parseInt(limitQuery as string, 10) : 20;

    let list: DataItem[];

    if (isGlobal && (postType === 'search' || postType === 'threadsearch')) {
        list = extractGlobalSearchList($, limit);
    } else {
        switch (postType) {
            case 'home':
                list = extractHomeList($, rootUrl, limit);
                break;
            case 'gold':
                list = extractGoldList($, rootUrl, limit);
                break;
            case 'threadsearch':
            case 'search':
                list = extractHtmlList($, rootUrl, limit);
                break;
            default:
                list = extractHtmlList($, rootUrl, limit);
                break;
        }
    }

    const items = await Promise.all(list.map((item) => fetchArticleDetail(item)));

    return {
        title: $('title').text(),
        link: currentUrl,
        item: items,
    };
}
