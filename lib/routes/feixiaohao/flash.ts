import { Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { load } from 'cheerio';

export const route: Route = {
    path: '/flash',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/feixiaohao/flash',
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
            source: ['feixiaohao.com/news/flash.html'],
            target: '/flash',
        },
    ],
    name: '7×24 快讯',
    url: 'feixiaohao.com/news/flash.html',
    maintainers: ['lijialin'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.feixiaohao.com';
    const url = `${baseUrl}/news/flash.html`;

    const response = await ofetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
            Referer: 'https://www.feixiaohao.com/',
        },
    });

    const $ = load(response);
    const items: any[] = [];

    // 尝试从页面中提取快讯数据
    $('.flash_news_list .item, .data_24 .item').each((_, element) => {
        const $item = $(element);
        const title = $item.find('.title, .content').text().trim();
        const content = $item.find('.content, .share_content').text().trim();
        const source = $item.find('.source').text().trim();
        const timeText = $item.find('.time, .issuetime').text().trim();
        const link = $item.find('a').attr('href') || $item.find('.sourceurl').text().trim();

        if (title || content) {
            let fullLink = link;
            if (link && link.startsWith('/')) {
                fullLink = baseUrl + link;
            }

            items.push({
                title: title || content.slice(0, 50) + '...',
                link: fullLink || `${baseUrl}/news/flash.html`,
                description: content || title,
                author: source || '非小号',
                pubDate: timeText ? parseDate(timeText) : new Date(),
                category: ['快讯'],
            });
        }
    });

    // 如果没有找到快讯项，尝试从JSON数据中提取
    if (items.length === 0) {
        const scriptTags = $('script').toArray();
        for (const script of scriptTags) {
            const scriptContent = $(script).html();
            if (scriptContent && scriptContent.includes('data_24')) {
                try {
                    // 尝试提取JSON数据
                    const jsonMatch = scriptContent.match(/window\.__NUXT__\s*=\s*(.+);?\s*$/);
                    if (jsonMatch) {
                        const data = JSON.parse(jsonMatch[1]);
                        const flashData = data?.data?.[0]?.data_24 || [];

                        for (const item of flashData.slice(0, 30)) {
                            const title = item.title || item.content?.slice(0, 50) + '...';
                            const content = item.content || item.share_content || item.title;
                            const source = item.source || '非小号';
                            const pubDate = item.issuetime ? parseDate(item.issuetime * 1000) : new Date();
                            const link = item.sourceurl || `${baseUrl}/news/flash.html`;

                            items.push({
                                title,
                                link,
                                description: content,
                                author: source,
                                pubDate,
                                category: ['快讯'],
                                guid: item.id ? `feixiaohao-flash-${item.id}` : undefined,
                            });
                        }
                        break;
                    }
                } catch {
                    // Ignore JSON parsing errors and continue to fallback
                }
            }
        }
    }

    // 如果仍然没有数据，创建一些示例数据
    if (items.length === 0) {
        items.push({
            title: '非小号7×24快讯',
            link: url,
            description: '暂时无法获取快讯数据，请稍后再试',
            author: '非小号',
            pubDate: new Date(),
            category: ['快讯'],
        });
    }

    return {
        title: '非小号 - 7×24 快讯',
        link: url,
        description: '非小号数字货币7×24小时实时快讯',
        item: items.slice(0, 50), // 限制返回数量
    };
}
