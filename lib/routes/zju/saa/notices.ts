import type { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/saa/notices',
    categories: ['university'],
    example: '/zju/saa/notices',
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
            source: ['saa.zju.edu.cn/67629/list.htm'],
        },
    ],
    name: '航空航天学院通知公告',
    maintainers: ['heikuisey'],
    handler,
    url: 'saa.zju.edu.cn/67629/list.htm',
};

async function handler() {
    const baseUrl = 'http://saa.zju.edu.cn';
    const listUrl = `${baseUrl}/67629/list.htm`;

    // 获取列表页面
    const response = await got({
        method: 'get',
        url: listUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });

    const $ = load(response.data);
    const items: any[] = [];

    // 查找所有包含通知链接的 a 标签
    // 根据页面分析，通知链接通常包含 saa.zju.edu.cn 域名
    $('a[href*="saa.zju.edu.cn"]').each((_, element) => {
        const $element = $(element);
        const title = $element.text().trim();
        let link = $element.attr('href');

        // 过滤掉导航链接和其他非通知链接
        if (title && link && (link.includes('/page.htm') || link.includes('/c67629a')) && !link.includes('/list.htm') && !link.includes('/main.htm') && title.length > 5) {
            // 确保链接是完整的
            if (!link.startsWith('http')) {
                link = baseUrl + link;
            }

            // 查找日期：在同一行或相邻位置查找 YYYY-MM-DD 格式的日期
            let pubDate: Date | null = null;
            const elementText = $element.parent().text() || $element.closest('tr, li, div, p').text();
            const dateMatch = elementText.match(/(\d{4}-\d{2}-\d{2})/);

            if (dateMatch) {
                pubDate = parseDate(dateMatch[1]);
            }

            // 避免重复添加
            const exists = items.some((item) => item.link === link);
            if (!exists) {
                items.push({
                    title,
                    link,
                    pubDate,
                    description: title,
                });
            }
        }
    });

    // 如果第一种方法没找到足够的条目，使用更宽泛的搜索
    if (items.length < 5) {
        // 查找所有可能的通知链接
        $('a').each((_, element) => {
            const $element = $(element);
            const title = $element.text().trim();
            let link = $element.attr('href');

            if (title && link && // 检查是否是通知页面链接
                (link.includes('/2024/') || link.includes('/2025/') || link.includes('/c67629a')) && link.includes('/page.htm')) {
                    // 构建完整链接
                    if (!link.startsWith('http')) {
                        link = link.startsWith('/') ? baseUrl + link : baseUrl + '/' + link;
                    }

                    // 查找日期
                    let pubDate: Date | null = null;
                    const surroundingText = $element.parent().text() || $element.closest('tr, li, div, p').text();
                    const dateMatch = surroundingText.match(/(\d{4}-\d{2}-\d{2})/);

                    if (dateMatch) {
                        pubDate = parseDate(dateMatch[1]);
                    }

                    // 避免重复添加
                    const exists = items.some((item) => item.link === link);
                    if (!exists && title.length > 5) {
                        items.push({
                            title,
                            link,
                            pubDate,
                            description: title,
                        });
                    }
                }
        });
    }

    // 去重并按日期排序
    const uniqueItems = items
        .filter((item, index, self) => index === self.findIndex((t) => t.link === item.link))
        .sort((a, b) => {
            if (!a.pubDate && !b.pubDate) {return 0;}
            if (!a.pubDate) {return 1;}
            if (!b.pubDate) {return -1;}
            return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });

    // 获取详细内容（仅处理前10条以提高性能）
    const detailedItems = await Promise.all(
        uniqueItems.slice(0, 10).map(async (item) => await cache.tryGet(item.link, async () => {
                try {
                    if (item.link.includes('saa.zju.edu.cn') && item.link.includes('/page.htm')) {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
                            timeout: {
                                request: 5000, // 5秒超时
                            },
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                            },
                        });

                        const detail$ = load(detailResponse.data);

                        // 移除不需要的元素
                        detail$('script, style, nav, header, footer, .nav, .menu, .sidebar, .header, .footer').remove();

                        // 获取主要内容
                        let content = '';

                        // 查找包含发布日期信息的元素，通常正文就在附近
                        const publishElement = detail$('*:contains("发布日期")');
                        if (publishElement.length > 0) {
                            // 从发布信息开始，获取后续的内容
                            let contentElement = publishElement.parent().next();
                            while (contentElement.length > 0 && contentElement.text().trim().length > 0) {
                                content += contentElement.html() + '\n';
                                contentElement = contentElement.next();
                                // 限制获取的段落数量
                                if (content.length > 2000) {break;}
                            }
                        }

                        // 如果没有找到发布日期，尝试其他方法
                        if (!content) {
                            // 查找可能包含正文的div
                            const possibleContainers = detail$('div').filter((_, el) => {
                                const text = detail$(el).text();
                                return text.length > 100 && text.length < 5000; // 合理的内容长度
                            });

                            if (possibleContainers.length > 0) {
                                content = detail$(possibleContainers[0]).html() || '';
                            }
                        }

                        // 最后手段：获取body中的主要文本内容
                        if (!content) {
                            const bodyText = detail$('body').clone();
                            bodyText.find('script, style, nav, header, footer').remove();
                            const mainText = bodyText.text().trim();
                            if (mainText.length > 50) {
                                content = `<p>${mainText.slice(0, 1000)}</p>`;
                            }
                        }

                        // 尝试从详情页面提取更准确的发布日期
                        const pageText = detail$('body').text();
                        const publishMatch = pageText.match(/发布日期[：:]\s*(\d{4}-\d{2}-\d{2})/);
                        if (publishMatch && !item.pubDate) {
                            item.pubDate = parseDate(publishMatch[1]);
                        }

                        if (content && content.trim().length > 0) {
                            item.description = content;
                        }
                    }
                } catch {
                    // 如果获取详细内容失败，保持原有的description
                }

                return item;
            }))
    );

    return {
        title: '浙江大学航空航天学院 - 通知公告',
        link: listUrl,
        description: '浙江大学航空航天学院最新通知公告RSS订阅',
        item: detailedItems,
    };
}
