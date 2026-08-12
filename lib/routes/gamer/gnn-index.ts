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
                { value: 'ns', label: 'Switch' }, { value: 'ps5', label: 'PS5' },
                { value: 'ps4', label: 'PS4' }, { value: 'xbone', label: 'XboxOne' }, { value: 'xbsx', label: 'XboxSX' },
                { value: 'pc', label: 'PC 單機' }, { value: 'olg', label: 'PC 線上' }, { value: 'ios', label: 'iOS' },
                { value: 'android', label: 'Android' }, { value: 'web', label: 'Web' }, { value: 'comic', label: '漫畫' },
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

const categoryTable: Record<string, string> = {
    ns: 'Switch', ps5: 'PS5', ps4: 'PS4',
    xbone: 'XboxOne', xbsx: 'XboxSX', pc: 'PC 單機', olg: 'PC 線上',
    ios: 'iOS', android: 'Android', web: 'Web', comic: '漫畫', anime: '動畫',
};

async function handler(ctx) {
    const category = ctx.req.param('category')?.toLowerCase();
    let categoryName = '';

    let targetUrl = 'https://gnn.gamer.com.tw/';
    if (category && Object.hasOwn(categoryTable, category)) {
        categoryName = '-' + categoryTable[category];
        targetUrl = `https://acg.gamer.com.tw/news.php?p=${category}`;
    }

    const response = await got({
        method: 'get',
        url: targetUrl,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://acg.gamer.com.tw/',
        },
    });

    const $ = load(response.data);
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 10;

    const list = $('a')
        .toArray()
        .map((item): DataItem | null => {
            const $item = $(item);
            const titleText = $item.text().trim();
            let link = $item.attr('href');

            if (!titleText || !link || titleText.length < 4) {
                return null;
            }
            if (!link.includes('detail.php') && !link.includes('gnn.gamer.com.tw/detail.php')) {
                return null;
            }

            if (link.startsWith('//')) {
                link = 'https:' + link;
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

    const items = await pMap(
        list,
        async (item) => {
            const cacheResult = await cache.tryGet(item.link!, async () => {
                const res = await got.get(item.link!, {
                    headers: { 
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Referer': targetUrl,
                    },
                });

                const _$ = load(res.data);
                let dateStr = '';
                let author = '';
                let $content;

                if (_$('span.GN-lbox3C').length > 0) {
                    const pubInfo = _$('span.GN-lbox3C').text().split('）');
                    author = pubInfo[0]?.replace('（', '').replace(' 報導', '').trim();
                    dateStr = pubInfo[1]?.trim();
                    $content = _$('div.GN-lbox3B');
                } else if (_$('span.GN-lbox3CA').length > 0) {
                    const pubInfo = _$('span.GN-lbox3CA').text().split('）');
                    author = pubInfo[0]?.replace('（', '').replace(' 報導', '').trim();
                    dateStr = pubInfo[1]?.replace('原文出處', '').trim();
                    $content = _$('div.GN-lbox3B');
                } else if (_$('div.MSG-list8C').length > 0) {
                    const pubInfo = _$('span.ST1').text().split('│');
                    author = pubInfo[0]?.replace('作者：', '').trim();
                    dateStr = pubInfo[_$('span.ST1').find('a').length > 0 ? 2 : 1]?.trim();
                    $content = _$('div.MSG-list8C');
                } else {
                    const pubInfo = _$('div.article-intro').text().replaceAll('\n', '').split('|');
                    author = pubInfo[0]?.trim();
                    dateStr = pubInfo[1]?.trim();
                    $content = _$('div.text-paragraph');
                }

                $content.find('img').each((_, img) => {
                    const $img = _$(img);
                    const dataSrc = $img.attr('data-src') || $img.attr('data-original');
                    if (dataSrc) {
                        $img.attr('src', dataSrc);
                        $img.removeAttr('data-src');
                        $img.removeAttr('data-original');
                    }
                });

                const parsedDate = dateStr ? timezone(parseDate(dateStr, 'YYYY-MM-DD HH:mm:ss'), 8) : undefined;

                return {
                    description: $content.html() ?? '',
                    author,
                    pubDate: parsedDate,
                };
            });

            return {
                ...item,
                ...cacheResult,
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
