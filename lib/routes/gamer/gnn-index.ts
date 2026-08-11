import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/gnn/:category?',
    categories: ['anime'],
    view: ViewType.Articles,
    example: '/gamer/gnn/ps5',
    parameters: {
        category: {
            description: '版塊',
            options: [
                { value: '1', label: 'PC' },
                { value: '3', label: 'TV 掌機' },
                { value: '4', label: '手機遊戲' },
                { value: '5', label: '動漫畫' },
                { value: '9', label: '主題報導' },
                { value: '11', label: '活動展覽' },
                { value: '13', label: '電競' },
                { value: 'ns', label: 'Switch' },
                { value: 'ps5', label: 'PS5' },
                { value: 'ps4', label: 'PS4' },
                { value: 'xbone', label: 'XboxOne' },
                { value: 'xbsx', label: 'XboxSX' },
                { value: 'pc', label: 'PC 單機' },
                { value: 'olg', label: 'PC 線上' },
                { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Android' },
                { value: 'web', label: 'Web' },
                { value: 'comic', label: '漫畫' },
                { value: 'anime', label: '動畫' },
            ],
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'GNN 新聞',
    maintainers: ['Arracc', 'ladeng07', 'pseudoyu'],
    handler,
    description: '缺省為首頁',
};

async function handler(ctx) {
    const rawCategory = ctx.req.param('category');
    const category = rawCategory ? String(rawCategory).toLowerCase() : '';
    let categoryName = '';

    const categoryTable: Record<string, string> = {
        '1': 'PC',
        '3': 'TV 掌機',
        '4': '手機遊戲',
        '5': '動漫畫',
        '9': '主題報導',
        '11': '活動展覽',
        '13': '電競',
        ns: 'Switch',
        ps5: 'PS5',
        ps4: 'PS4',
        xbone: 'XboxOne',
        xbsx: 'XboxSX',
        pc: 'PC 單機',
        olg: 'PC 線上',
        ios: 'iOS',
        android: 'Android',
        web: 'Web',
        comic: '漫畫',
        anime: '動畫',
    };

    let targetUrl = 'https://gnn.gamer.com.tw/';
    // 修正點 1: 使用 Object.hasOwn 檢查物件 key 避免 ESLint 警告
    if (category && Object.hasOwn(categoryTable, category)) {
        categoryName = '-' + categoryTable[category];
        targetUrl = `https://gnn.gamer.com.tw/index.php?k=${category}`;
    }

    const response = await got({
        method: 'get',
        url: targetUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://gnn.gamer.com.tw/',
        },
    });

    const htmlContent = typeof response.data === 'string' ? response.data : String(response.body || '');
    const $ = load(htmlContent);
    
    // 修正點 2: 使用 Math.trunc(Number(...)) 代替 Number.parseInt()
    const limitQuery = ctx.req.query('limit');
    const limit = limitQuery ? Math.trunc(Number(limitQuery)) : 10;

    const list = $('.GN-lbox2B h1 a, .GN-lbox2D a, a.GN-lbox2D, .GN-lbox2E a')
        .toArray()
        .map((item): DataItem | null => {
            const $item = $(item);
            const titleText = $item.text().trim();
            let link = $item.attr('href');

            if (!titleText || !link) {
                return null;
            }

            if (link.startsWith('//')) {
                link = 'https:' + link;
            } else if (link.startsWith('/')) {
                link = new URL(link, 'https://gnn.gamer.com.tw/').href;
            }

            if (!link.includes('detail.php')) {
                return null;
            }

            return {
                title: titleText,
                link,
            };
        })
        .filter((item, index, self): item is DataItem => {
            if (!item) {
                return false;
            }
            return index === self.findIndex((t) => t?.link === item.link);
        })
        .slice(0, limit);

    if (list.length === 0) {
        return {
            title: '巴哈姆特-GNN新聞' + categoryName,
            link: targetUrl,
            item: [
                {
                    title: '暫無新文章或版塊更新中',
                    link: targetUrl,
                    description: '未能抓取到文章，請檢查原站鏈接。',
                },
            ],
        };
    }

    const items = await pMap(
        list,
        async (item) => {
            const cacheKey = item.link!;

            const articleData = await cache.tryGet(cacheKey, async () => {
                const res = await got.get(item.link!, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        Referer: targetUrl,
                    },
                });

                const pageHtml = typeof res.data === 'string' ? res.data : String(res.body || '');
                const _$ = load(pageHtml);

                let author: string | undefined;
                let pubDate: Date | string | undefined;

                const $pubInfo = _$('span.GN-lbox3C, span.GN-lbox3CA').first();
                if ($pubInfo.length > 0) {
                    const pubInfoText = $pubInfo.text();
                    const pubInfoParts = pubInfoText.split('）');
                    author = pubInfoParts[0]?.replace('（', '').replace(' 報導', '').trim();
                    const dateStr = pubInfoParts[1]?.replace('原文出處', '').trim();

                    if (dateStr) {
                        try {
                            pubDate = timezone(parseDate(dateStr, 'YYYY-MM-DD HH:mm:ss'), 8);
                        } catch {
                            // 忽略日期解析錯誤
                        }
                    }
                }

                const $content = _$('div.GN-lbox3B, div.text-paragraph').first();

                $content.find('img').each((_, el) => {
                    const $img = _$(el);
                    const dataSrc = $img.attr('data-src');
                    if (dataSrc) {
                        $img.attr('src', dataSrc);
                        $img.removeAttr('data-src');
                    }
                });

                const description = $content.html()?.trim() || item.title;

                return {
                    description,
                    author,
                    pubDate,
                };
            });

            return {
                ...item,
                ...articleData,
            };
        },
        { concurrency: 2 }
    );

    return {
        title: '巴哈姆特-GNN新聞' + categoryName,
        link: targetUrl,
        item: items,
    };
}
