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
    const response = await fetchListPage(listUrl);
    const $ = load(response.data);

    // 提取通知条目
    const items = extractNoticeItems($, baseUrl);

    // 去重并排序
    const uniqueItems = processAndSortItems(items);

    // 获取详细内容（仅处理前10条以提高性能）
    const detailedItems = await Promise.all(uniqueItems.slice(0, 10).map(async (item) => await cache.tryGet(item.link, async () => await fetchItemDetail(item))));

    return {
        title: '浙江大学航空航天学院 - 通知公告',
        link: listUrl,
        description: '浙江大学航空航天学院最新通知公告RSS订阅',
        item: detailedItems,
    };
}

async function fetchListPage(url: string) {
    return await got({
        method: 'get',
        url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });
}

function extractNoticeItems($: any, baseUrl: string) {
    let items: any[] = [];

    // 首先尝试提取标准通知链接
    items = extractPrimaryNoticeLinks($, baseUrl);

    // 如果没找到足够的条目，使用备选方法
    if (items.length < 5) {
        items = [...items, ...extractSecondaryNoticeLinks($, baseUrl)];
    }

    return items;
}

function extractPrimaryNoticeLinks($: any, baseUrl: string): any[] {
    const items: any[] = [];

    $('a[href*="saa.zju.edu.cn"]').each((_, element) => {
        const noticeItem = extractNoticeFromElement($, element, baseUrl);
        if (noticeItem && isValidPrimaryNotice(noticeItem)) {
            addUniqueItem(items, noticeItem);
        }
    });

    return items;
}

function extractSecondaryNoticeLinks($: any, baseUrl: string): any[] {
    const items: any[] = [];

    $('a').each((_, element) => {
        const noticeItem = extractNoticeFromElement($, element, baseUrl);
        if (noticeItem && isValidSecondaryNotice(noticeItem)) {
            addUniqueItem(items, noticeItem);
        }
    });

    return items;
}

function extractNoticeFromElement($: any, element: any, baseUrl: string) {
    const $element = $(element);
    const title = $element.text().trim();
    let link = $element.attr('href');

    if (!title || !link || title.length <= 5) {
        return null;
    }

    // 构建完整链接
    link = buildFullUrl(link, baseUrl);

    // 提取发布日期
    const pubDate = extractDateFromContext($, $element);

    return {
        title,
        link,
        pubDate,
        description: title,
    };
}

function isValidPrimaryNotice(item: any): boolean {
    const { link } = item;
    return (link.includes('/page.htm') || link.includes('/c67629a')) && !link.includes('/list.htm') && !link.includes('/main.htm');
}

function isValidSecondaryNotice(item: any): boolean {
    const { link, title } = item;
    return (link.includes('/2024/') || link.includes('/2025/') || link.includes('/c67629a')) && link.includes('/page.htm') && title.length > 5;
}

function buildFullUrl(link: string, baseUrl: string): string {
    if (link.startsWith('http')) {
        return link;
    }
    return link.startsWith('/') ? baseUrl + link : baseUrl + '/' + link;
}

function extractDateFromContext($: any, $element: any): Date | null {
    const contextText = $element.parent().text() || $element.closest('tr, li, div, p').text();
    const dateMatch = contextText.match(/(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? parseDate(dateMatch[1]) : null;
}

function addUniqueItem(items: any[], newItem: any): void {
    const exists = items.some((item) => item.link === newItem.link);
    if (!exists) {
        items.push(newItem);
    }
}

function processAndSortItems(items: any[]): any[] {
    return items
        .filter((item, index, self) => index === self.findIndex((t) => t.link === item.link))
        .sort((a, b) => {
            if (!a.pubDate && !b.pubDate) {
                return 0;
            }
            if (!a.pubDate) {
                return 1;
            }
            if (!b.pubDate) {
                return -1;
            }
            return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
        });
}

async function fetchItemDetail(item: any) {
    try {
        if (shouldFetchDetailContent(item.link)) {
            const detailResponse = await fetchDetailPage(item.link);
            const detail$ = load(detailResponse.data);

            cleanupDetailPage(detail$);
            const content = extractMainContent(detail$);
            const updatedPubDate = extractPublishDate(detail$, item);

            return createDetailedItem(item, content, updatedPubDate);
        }
    } catch {
        // 如果获取详细内容失败，保持原有的description
    }
    return item;
}

function shouldFetchDetailContent(link: string): boolean {
    return link.includes('saa.zju.edu.cn') && link.includes('/page.htm');
}

async function fetchDetailPage(url: string) {
    return await got({
        method: 'get',
        url,
        timeout: 5000, // 5秒超时
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
    });
}

function cleanupDetailPage(detail$: any) {
    detail$('script, style, nav, header, footer, .nav, .menu, .sidebar, .header, .footer, .search-con, .layer, img').remove();
}

function extractMainContent(detail$: any): string {
    return extractContentByArticleDiv(detail$) || extractContentByPublishDate(detail$) || extractContentByContainer(detail$) || extractContentFromBody(detail$);
}

function extractContentByArticleDiv(detail$: any): string {
    // 优先提取 wp_articlecontent 中的内容
    const articleContent = detail$('.wp_articlecontent');
    if (articleContent.length > 0) {
        return articleContent.html() || '';
    }

    // 其次尝试提取 article 或 entry 类中的内容
    const entryContent = detail$('.entry .read, .article .read, .wp_articlecontent');
    if (entryContent.length > 0) {
        return entryContent.html() || '';
    }

    return '';
}

function extractContentByPublishDate(detail$: any): string {
    const publishElement = detail$('*:contains("发布日期")');
    if (publishElement.length === 0) {
        return '';
    }

    let content = '';
    let contentElement = publishElement.parent().next();

    while (contentElement.length > 0 && contentElement.text().trim().length > 0) {
        content += contentElement.html() + '\n';
        contentElement = contentElement.next();

        if (content.length > 2000) {
            break;
        }
    }

    return content;
}

function extractContentByContainer(detail$: any): string {
    const possibleContainers = detail$('div').filter((_, el) => {
        const text = detail$(el).text();
        return text.length > 100 && text.length < 5000;
    });

    return possibleContainers.length > 0 ? detail$(possibleContainers[0]).html() || '' : '';
}

function extractContentFromBody(detail$: any): string {
    const bodyText = detail$('body').clone();
    bodyText.find('script, style, nav, header, footer').remove();
    const mainText = bodyText.text().trim();

    return mainText.length > 50 ? `<p>${mainText.slice(0, 1000)}</p>` : '';
}

function extractPublishDate(detail$: any, item: any): Date | null {
    const pageText = detail$('body').text();
    const publishMatch = pageText.match(/发布日期[：:]\s*(\d{4}-\d{2}-\d{2})/);

    if (publishMatch && !item.pubDate) {
        return parseDate(publishMatch[1]);
    }

    return item.pubDate;
}

function createDetailedItem(item: any, content: string, pubDate: Date | null) {
    const updatedItem = { ...item };

    if (pubDate) {
        updatedItem.pubDate = pubDate;
    }

    if (content && content.trim().length > 0) {
        updatedItem.description = content;
    }

    return updatedItem;
}
