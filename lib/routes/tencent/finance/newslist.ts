import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const NEWSLIST_CACHE_TTL = 1;
const NEWS_DETAIL_URL = 'https://wzq.tenpay.com/mp/v1/information/detail.shtml';

type StockItem = {
    name: string;
    code: string;
    change?: number | string | null;
};

type TencentNewsItem = {
    id: string | number;
    url?: string;
    source?: string;
    publish_time: number;
    is_top?: number;
    is_red?: number;
    content?: string;
    new_title?: string;
    new_content?: string;
    label_list?: Array<{
        label_name?: string;
    }>;
    relate_stocks?: Array<{
        symbol?: string;
        name?: string;
    }>;
};

export function pickLink(item: { id: string | number; url?: string }) {
    const rawUrl = item.url?.trim();

    if (rawUrl) {
        if (rawUrl.startsWith('http://')) {
            return rawUrl.replace(/^http:/, 'https:');
        }

        if (rawUrl.startsWith('https://')) {
            return rawUrl;
        }

        if (rawUrl.startsWith('//')) {
            return `https:${rawUrl}`;
        }

        if (rawUrl.startsWith('/')) {
            return new URL(rawUrl, NEWS_DETAIL_URL).href;
        }
    }

    const link = new URL(NEWS_DETAIL_URL);
    link.searchParams.set('id', String(item.id));
    return link.href;
}

function formatChange(change: number | string | null | undefined): { color: string; arrow: string; display: string } | null {
    if (change === null || change === undefined) {
        return null;
    }
    const num = typeof change === 'string' ? Number.parseFloat(change.replace('%', '')) : change;
    if (Number.isNaN(num)) {
        return null;
    }
    const color = num > 0 ? '#f5222d' : num < 0 ? '#52c41a' : '#666';
    const arrow = num > 0 ? '↑' : num < 0 ? '↓' : '-';
    const sign = num > 0 ? '+' : '';
    const display = typeof change === 'string' && change.includes('%') ? `${sign}${change}` : `${sign}${num.toFixed(2)}%`;
    return { color, arrow, display };
}

function renderStockCard(label: string, borderColor: string, items: StockItem[]): string {
    let inner = '';
    for (const item of items) {
        inner += `• <strong>${item.name}</strong> <span style="color: #999;">(${item.code})</span><br>`;
        const fmt = formatChange(item.change);
        if (fmt) {
            inner += `<span style="color: ${fmt.color}; font-weight: bold;">${fmt.arrow} ${fmt.display}</span><br>`;
        }
    }

    if (!inner) {
        return '';
    }

    return (
        `<br><div style="background: #f5f5f5; border-left: 3px solid ${borderColor}; padding: 10px 15px; margin: 15px 0 10px 0; border-radius: 4px;">` +
        `<h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #333;">${label}</h3>` +
        `${inner}</div>`
    );
}

function applyTencentImportance(item: DataItem, sourceItem: TencentNewsItem): DataItem {
    const categories = [...(item.category ?? [])];
    let title = item.title;

    if (Number(sourceItem.is_top) === 1 || Number(sourceItem.is_red) === 1) {
        if (!title.startsWith('「重要」')) {
            title = `「重要」${title}`;
        }
        categories.push('重要');
    }

    return {
        ...item,
        title,
        category: [...new Set(categories)],
    };
}

export const route: Route = {
    path: '/finance/newslist',
    name: '财经快讯 - 自选股',
    url: 'gu.qq.com',
    maintainers: ['luck'],
    handler,
    example: '/tencent/finance/newslist',
    description: `使用腾讯自选股移动端接口获取实时财经快讯

⚠️ **重要说明**：

- 由于 API 需要签名验证，当前使用固定签名（可能会过期）
- 每次固定返回最新 10 条快讯
- 如签名过期，需要更新代码中的 fixedParams

支持查询参数：

- \`limit=10\` - 限制返回数量（最多 10 条，默认 10 条）

特点：

- 📱 移动端专用接口
- 📊 包含股票涨跌幅数据
- 🏷️ 支持热门标签分类
- ⏱️ 实时性强

示例：

- \`/tencent/finance/newslist\` - 获取最新 10 条财经快讯
- \`/tencent/finance/newslist?limit=5\` - 获取最新 5 条快讯`,
    categories: ['finance'],
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
            source: ['gu.qq.com/'],
            target: '/finance/newslist',
        },
    ],
    view: ViewType.Notifications,
    cacheTtl: NEWSLIST_CACHE_TTL,
};

async function handler(ctx): Promise<Data> {
    const limitParam = Number.parseInt(ctx.req.query('limit') ?? '10', 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 10) : 10;

    const baseUrl = 'https://snp.tenpay.com';
    const apiUrl = `${baseUrl}/cgi-bin/snpgw_724_newslist.fcgi`;

    // Captured from QQ Stock iOS 11.32.0. The signature may need refreshing when Tencent expires it.
    const fixedParams = {
        reserve: '2149056560',
        filter: '0',
        limit: '10',
        offset: '0',
        hot_label: '0',
        req_session: '0',
        zappid: 'zxg_h5',
        sign: '116148801e817c775f5e31565bd8a8c1',
        nonce: '8431',
        _appver: '11.32.0',
        _devId: '7e8ba3a8ed2491b4c906dbb430e86b887acc5c7e',
        check: '-1',
        _ui: '7e8ba3a8ed2491b4c906dbb430e86b887acc5c7e',
        fskey: 'anonymous',
        _appName: 'ios',
        openid: 'anonymous',
        buildType: 'store',
        _osVer: '26.0.1',
        _dev: 'iPhone18,2',
        lang: 'en_US',
        _isChId: '1',
    };

    let hotLabels: Array<{ name?: string }> = [];
    let collected: TencentNewsItem[] = [];

    try {
        const data = await cache.tryGet(
            'tencent:finance:newslist',
            async () => {
                const response = await got(apiUrl, {
                    searchParams: fixedParams,
                    headers: {
                        'User-Agent': 'QQStock/11.32.0 (iPhone; iOS 26.0.1; Scale/3.00)',
                        Referer: 'http://zixuanguapp.finance.qq.com',
                        Accept: '*/*',
                        'Accept-Language': 'en-US;q=1, zh-Hans-US;q=0.9',
                        'Accept-Encoding': 'gzip,deflate',
                        'X-Forwarded-For': '116.228.111.18',
                        'X-Real-IP': '116.228.111.18',
                        'Client-IP': '116.228.111.18',
                    },
                    timeout: 30000,
                });

                const data = response.data;

                if (data.retcode !== '0') {
                    throw new Error(`API Error: ${data.retmsg || 'Unknown error'}`);
                }

                return data;
            },
            NEWSLIST_CACHE_TTL,
            false
        );

        if (data.hot_label && data.hot_label.length > 0) {
            hotLabels = data.hot_label;
        }

        const newsList = data.data || [];
        collected = newsList.slice(0, Math.min(limit, 10));
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch news: ${message}`, {
            cause: error,
        });
    }

    const allStocks = new Set<string>();
    for (const item of collected.slice(0, limit)) {
        if (item.relate_stocks && Array.isArray(item.relate_stocks)) {
            for (const stock of item.relate_stocks) {
                if (stock.symbol) {
                    allStocks.add(stock.symbol);
                }
            }
        }
    }

    const stockMap: Record<string, { name: string; price: string; change: string }> = {};
    if (allStocks.size > 0) {
        try {
            const stockCodes = [...allStocks].join(',');
            const stockResponse = await got({
                method: 'get',
                url: `https://qt.gtimg.cn/q=${stockCodes}`,
                headers: {
                    Referer: 'https://gu.qq.com/',
                },
                responseType: 'text',
            });

            const lines = stockResponse.data.split('\n');
            for (const line of lines) {
                const match = line.match(/v_([^=]+)="([^"]+)"/);
                if (match) {
                    const code = match[1];
                    const fields = match[2].split('~');
                    if (fields.length > 5) {
                        stockMap[code] = {
                            name: fields[1],
                            price: fields[3],
                            change: fields[32] || fields[5],
                        };
                    }
                }
            }
        } catch {
            // Stock quote cards are supplemental; keep the news feed available if quotes fail.
        }
    }

    const items = collected.slice(0, limit).map((item) => {
        const content = item.new_content || item.content || '';
        const newsId = item.id;
        const pubDate = timezone(parseDate(item.publish_time * 1000), +8);

        const title =
            item.new_title ||
            (() => {
                const cleanContent = content.replaceAll(/<[^>]+>/g, '');
                const titleMatch = cleanContent.match(/【([^】]+)】/);
                return titleMatch ? titleMatch[1] : cleanContent.slice(0, 100) || `财经快讯 ${newsId}`;
            })();

        let description = '<div style="padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 5px; margin-bottom: 10px;">';
        description += '<p style="margin: 0; line-height: 1.8; font-size: 15px;">';
        let cleanContent = content.replace(/【[^】]+】/, '').trim();
        cleanContent = cleanContent.replaceAll(/<a[^>]*href\s*=\s*"stock:\/\/[^">]*"[^>]*>([^<]+)<\/a>/g, '<em><strong>$1</strong></em>');

        description += cleanContent;
        description += '</p></div>';

        const stockList = item.relate_stocks || [];
        if (stockList.length > 0) {
            const sectors: StockItem[] = [];
            const individualStocks: StockItem[] = [];

            for (const stock of stockList) {
                const stockCode = stock.symbol || '';
                const stockInfo = stockMap[stockCode];
                if (!stockInfo) {
                    continue;
                }

                const stockItem: StockItem = {
                    name: stock.name || stockInfo.name,
                    code: stockCode.toUpperCase(),
                    change: Number.parseFloat(stockInfo.change) || 0,
                };

                if (stockCode.startsWith('cs') || stockCode.startsWith('pt') || stockCode.startsWith('bk')) {
                    sectors.push(stockItem);
                } else {
                    individualStocks.push(stockItem);
                }
            }

            description += renderStockCard('相关板块', '#1890ff', sectors) + renderStockCard('相关股票', '#52c41a', individualStocks);
        }

        const categories: string[] = [];

        for (const label of item.label_list || []) {
            if (label.label_name) {
                categories.push(label.label_name);
            }
        }

        for (const stock of stockList) {
            if (stock.name) {
                categories.push(stock.name);
            }
        }

        return applyTencentImportance(
            {
                title,
                description,
                link: pickLink(item),
                guid: `tencent-zxg-${newsId}`,
                pubDate,
                category: [...new Set(categories)],
                author: item.source || '腾讯自选股',
            },
            item
        );
    });

    let titleSuffix = '';
    const labelNames = hotLabels
        .map((label) => label.name)
        .filter(Boolean)
        .join('、');
    if (labelNames) {
        titleSuffix = ` - 热门: ${labelNames}`;
    }

    return {
        title: `腾讯自选股 - 财经快讯${titleSuffix}`,
        link: 'https://gu.qq.com/',
        description: '腾讯自选股实时财经快讯',
        item: items,
        language: 'zh-CN',
        author: '腾讯自选股',
        image: 'https://gu.qq.com/favicon.ico',
    };
}
