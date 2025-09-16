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

async function handler(ctx: Context) {
    const tab = ctx.req.param('tab') ?? '0';
    const baseUrl = 'https://www.feixiaohao.com';

    // 分类映射
    const categoryMap = {
        '0': '头条',
        '1': '新闻',
        '2': '政策',
        '4': '技术',
        '5': '区块链',
        '6': '研究',
        '7': '教程',
    };

    const categoryName = categoryMap[tab] || '头条';

    // 获取新闻列表页面
    const url = `${baseUrl}/news?tab=${tab}`;
    const response = await ofetch(url, {
        headers: DEFAULT_HEADERS,
    });

    const $ = load(response);

    // 解析新闻列表
    const items: any[] = [];

    // 从页面中提取JSON数据（非小号使用Nuxt.js，数据在window.__NUXT__中）
    const scriptTags = $('script').toArray();

    for (const script of scriptTags) {
        const scriptContent = $(script).html();
        if (scriptContent && scriptContent.includes('window.__NUXT__')) {
            try {
                // 提取JSON数据 - 非小号使用函数包装的格式
                const jsonMatch = scriptContent.match(/window\.__NUXT__\s*=\s*(.+);?\s*$/);
                if (jsonMatch) {
                    const jsonStr = jsonMatch[1];
                    let data: any;

                    // 处理函数包装的格式，如 (function(a,b,c){return {...}})("","",...)
                    if (jsonStr.startsWith('(function(')) {
                        // 使用vm模块在隔离环境中安全执行JavaScript代码
                        try {
                            // 创建一个新的上下文，隔离执行环境
                            const context = vm.createContext({});
                            // 在隔离环境中执行代码，设置超时防止无限循环
                            data = vm.runInContext(jsonStr, context, { timeout: 1000 });
                        } catch {
                            continue;
                        }
                    } else {
                        // 尝试直接解析JSON
                        try {
                            data = JSON.parse(jsonStr);
                        } catch {
                            continue;
                        }
                    }

                    // 根据tab参数选择不同的数据源
                    const newsData: any[] = tab === '0' ? [...(data?.data?.[0]?.bannerList || []), ...(data?.data?.[0]?.data_hot || [])] : data?.data?.[0]?.data_hot || [];

                    for (const item of newsData.slice(0, 20)) {
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
                    break;
                }
            } catch {
                // 忽略解析错误，继续尝试其他脚本
            }
        }
    }

    // 如果仍然没有找到数据，尝试从HTML中提取（备用方案）
    if (items.length === 0) {
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
    }

    // 获取文章详情
    const processedItems = await Promise.all(
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

    return {
        title: `非小号 - ${categoryName}新闻`,
        link: url,
        description: `非小号${categoryName}分类的最新新闻资讯`,
        item: processedItems.filter((item) => item.title && item.link),
    };
}
