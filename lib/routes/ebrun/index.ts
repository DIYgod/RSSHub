import type { Route, Data } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/ebrun',
    parameters: {},
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
            source: ['ebrun.com/', 'ebrun.com'],
            target: '/',
        },
    ],
    name: '最新资讯',
    maintainers: ['Vikati142'],
    handler,
    url: 'ebrun.com',
    description: '亿邦动力最新电商资讯、跨境电商、产业互联网等内容',
};

async function handler(): Promise<Data> {
    const baseUrl = 'https://www.ebrun.com';

    // 获取首页内容
    const response = await got(baseUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });

    const $ = load(response.data);
    const items: Array<{
        title: string;
        link: string;
        pubDate: Date;
        description: string;
    }> = [];

    // 查找文章链接
    $('a[href]').each((_, elem) => {
        const $elem = $(elem);
        const href = $elem.attr('href');
        const title = $elem.text().trim();
        // 过滤有效的文章链接
        if (href && title &&
            title.length > 10 &&
            (/\/20\d{6}\/\d+\.shtml$/.test(href) || href.startsWith('/20')) &&
            !href.includes('javascript') &&
            !href.includes('mailto') &&
            !href.includes('#')) {
            // 构建完整URL
            const fullUrl = href.startsWith('http') ? href : baseUrl + href;
            // 提取日期信息
            const dateMatch = href.match(/\/(20\d{2})(\d{2})(\d{2})\//);
            let pubDate = new Date();
            if (dateMatch) {
                const [, year, month, day] = dateMatch;
                pubDate = new Date(`${year}-${month}-${day}`);
            }
            items.push({
                title,
                link: fullUrl,
                pubDate: timezone(pubDate, +8),
                description: title
            });
        }
    });

    // 去重并按日期排序
    const uniqueItems = items
        .filter((item, index, self) =>
            index === self.findIndex((t) => t.link === item.link)
        )
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 20);

    // 获取文章详细内容
    const detailedItems = await Promise.all(
        uniqueItems.map(async (item) => {
            try {
                const articleResponse = await got(item.link, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    },
                });
                const article$ = load(articleResponse.data);
                // 尝试提取文章内容
                let description = '';
                const contentSelectors = [
                    '.article-content',
                    '.content',
                    '.post-content',
                    'article',
                    '.main-content',
                    '[class*="content"]'
                ];
                for (const selector of contentSelectors) {
                    const content = article$(selector).first();
                    if (content.length > 0) {
                        content.find('script, style, .ad, .advertisement').remove();
                        description = content.text().trim();
                        break;
                    }
                }
                // 如果没有找到内容，使用标题作为描述，否则截取摘要
                description = (!description || description.length < 50)
                    ? item.title
                    : description.slice(0, 300) + (description.length > 300 ? '...' : '');
                // 尝试提取更准确的发布时间
                const timeSelectors = [
                    '[class*="time"]',
                    '[class*="date"]',
                    'time',
                    '.publish-time',
                    '.post-time'
                ];
                for (const selector of timeSelectors) {
                    const timeElem = article$(selector).first();
                    if (timeElem.length > 0) {
                        const timeText = timeElem.text().trim();
                        const parsedDate = parseDate(timeText);
                        if (parsedDate && !Number.isNaN(parsedDate.getTime())) {
                            item.pubDate = timezone(parsedDate, +8);
                            break;
                        }
                    }
                }
                return {
                    ...item,
                    description
                };
            } catch {
                // Failed to fetch article content, return original item
                return item;
            }
        })
    );

    return {
        title: '亿邦动力 - 电商知识服务平台',
        link: baseUrl,
        description: '亿邦动力最新电商资讯、跨境电商、产业互联网等内容',
        language: 'zh-cn' as const,
        item: detailedItems
    };
}