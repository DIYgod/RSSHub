import { Context } from 'hono';
import vm from 'node:vm';

import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/news/:tab?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/feixiaohao/news',
    parameters: {
        tab: {
            description: '新闻分类',
            default: '0',
            options: [
                { label: '头条', value: '0' },
                { label: '新闻', value: '1' },
                { label: '政策', value: '2' },
                { label: '技术', value: '4' },
                { label: '区块链', value: '5' },
                { label: '研究', value: '6' },
                { label: '教程', value: '7' },
            ],
        },
    },
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
            source: ['feixiaohao.com/news', 'feixiaohao.com/news?tab=:tab'],
            target: '/news/:tab',
        },
    ],
    name: '新闻资讯',
    url: 'feixiaohao.com/news',
    maintainers: ['lijialin'],
    handler,
};

const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: 'https://www.feixiaohao.com/',
};

const CATEGORY_MAP = {
    '0': '头条',
    '1': '新闻',
    '2': '政策',
    '4': '技术',
    '5': '区块链',
    '6': '研究',
    '7': '教程',
};

function extractNewsDataFromScript(scriptContent: string): any[] {
    const items: any[] = [];

    if (!scriptContent?.includes('window.__NUXT__')) {
        return items;
    }

    try {
        const jsonMatch = scriptContent.match(/window\.__NUXT__\s*=\s*(.+);?\s*$/);
        if (!jsonMatch) {
            return items;
        }

        const jsonStr = jsonMatch[1];
        let data: any;

        if (jsonStr.startsWith('(function(')) {
            try {
                const context = vm.createContext({});
                data = vm.runInContext(jsonStr, context, { timeout: 1000 });
            } catch {
                return items;
            }
        } else {
            try {
                data = JSON.parse(jsonStr);
            } catch {
                return items;
            }
        }

        return data?.data?.[0] || {};
    } catch {
        return items;
    }
}

function parseNewsItems(newsData: any, tab: string, categoryName: string, baseUrl: string): any[] {
    const items: any[] = [];
    const dataSource = tab === '0' ? [...(newsData.bannerList || []), ...(newsData.data_hot || [])] : newsData.data_hot || [];

    for (const item of dataSource.slice(0, 20)) {
        if (item.title && item.id) {
            items.push({
                title: item.title,
                link: `${baseUrl}/news/${item.id}`,
                description: item.summary || item.content || item.title,
                author: item.author || item.username || '非小号',
                pubDate: parseDate(item.issuetime * 1000),
                category: [categoryName],
            });
        }
    }

    return items;
}

function parseHtmlFallback($: any, categoryName: string, baseUrl: string): any[] {
    const items: any[] = [];

    $('.data_hot .item, .bannerList .item, .hotNews .item').each((_, element) => {
        const $item = $(element);
        const title = $item.find('.title, h3, .summary').text().trim() || $item.find('a').attr('title') || $item.text().trim().split('\n')[0];
        const link = $item.find('a').attr('href');
        const summary = $item.find('.summary, .content').text().trim();
        const author = $item.find('.author, .username').text().trim();
        const timeText = $item.find('.time, .issuetime').text().trim();

        if (title && link) {
            let fullLink = link;
            if (link.startsWith('/')) {
                fullLink = baseUrl + link;
            } else if (!link.startsWith('http')) {
                fullLink = `${baseUrl}/news/${link}`;
            }

            items.push({
                title,
                link: fullLink,
                description: summary || title,
                author: author || '非小号',
                pubDate: timeText ? parseDate(timeText) : new Date(),
                category: [categoryName],
            });
        }
    });

    return items;
}

function enrichItemsWithContent(items: any[], baseUrl: string): Promise<any[]> {
    return Promise.all(
        items.slice(0, 15).map((item) =>
            cache.tryGet(item.link, async () => {
                try {
                    const articleResponse = await ofetch(item.link, {
                        headers: {
                            ...DEFAULT_HEADERS,
                            Referer: baseUrl,
                        },
                    });

                    const $article = load(articleResponse);
                    const content = $article('.article-content, .content, .news-content').html() || $article('article').html() || item.description;

                    return {
                        ...item,
                        description: content || item.description,
                    };
                } catch {
                    return item;
                }
            })
        )
    );
}

async function handler(ctx: Context) {
    const tab = ctx.req.param('tab') ?? '0';
    const baseUrl = 'https://www.feixiaohao.com';
    const categoryName = CATEGORY_MAP[tab] || '头条';
    const url = `${baseUrl}/news?tab=${tab}`;

    // 获取新闻列表页面
    const response = await ofetch(url, { headers: DEFAULT_HEADERS });
    const $ = load(response);

    let items: any[] = [];

    // 从页面中提取JSON数据
    const scriptTags = $('script').toArray();
    for (const script of scriptTags) {
        const scriptContent = $(script).html();
        if (scriptContent) {
            const newsData = extractNewsDataFromScript(scriptContent);

            if (newsData && Object.keys(newsData).length > 0) {
                items = parseNewsItems(newsData, tab, categoryName, baseUrl);
                break;
            }
        }
    }

    // 如果没有找到数据，使用HTML解析作为备用方案
    if (items.length === 0) {
        items = parseHtmlFallback($, categoryName, baseUrl);
    }

    // 获取文章详情
    const processedItems = await enrichItemsWithContent(items, baseUrl);

    return {
        title: `非小号 - ${categoryName}新闻`,
        link: url,
        description: `非小号${categoryName}分类的最新新闻资讯`,
        item: processedItems.filter((item) => item.title && item.link),
    };
}
