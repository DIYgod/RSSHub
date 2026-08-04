import { config } from '@/config';
import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { CopyTradingDetail, CopyTradingDetailResponse, CopyTradingOrder, CopyTradingOrderHistoryResponse } from './types';

const BASE_URL = 'https://www.binance.com';

const SIDE_MAP: Record<string, string> = {
    BUY_LONG: 'Open Long',
    SELL_LONG: 'Close Long',
    BUY_SHORT: 'Open Short',
    SELL_SHORT: 'Close Short',
};

const buildHeaders = (portfolioId: string) => ({
    Referer: `${BASE_URL}/zh-CN/copy-trading/lead-details/${portfolioId}`,
    'Content-Type': 'application/json',
    'User-Agent': config.trueUA,
});

const formatNumber = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 });

const getActionLabel = (order: CopyTradingOrder) => SIDE_MAP[`${order.side}_${order.positionSide}`] ?? order.side;

const buildOrderTitle = (order: CopyTradingOrder) => `${getActionLabel(order)} ${order.symbol} @ ${formatNumber(order.avgPrice)}`;

const buildOrderDescription = (order: CopyTradingOrder) => {
    const rows = [
        ['Symbol', order.symbol],
        ['Side', order.side],
        ['Position', order.positionSide],
        ['Type', order.type],
        ['Avg Price', `${formatNumber(order.avgPrice)} ${order.quoteAsset}`],
        ['Executed Qty', `${formatNumber(order.executedQty)} ${order.baseAsset}`],
        ['Total Value', `${formatNumber(order.avgPrice * order.executedQty)} ${order.quoteAsset}`],
    ]
        .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
        .join('');

    let pnlRow = '';
    if (order.side === 'SELL' && order.totalPnl !== 0) {
        const pnlColor = order.totalPnl >= 0 ? '#2EBD85' : '#F6465D';
        pnlRow = `<tr><td>Realized PnL</td><td style="color:${pnlColor}">${formatNumber(order.totalPnl)} ${order.quoteAsset}</td></tr>`;
    }

    return `<table><tbody>${rows}${pnlRow}</tbody></table>`;
};

const fetchDetail = (portfolioId: string) =>
    cache.tryGet(`binance:copy-trading:detail:${portfolioId}`, async () => {
        const response = await ofetch<CopyTradingDetailResponse>(`${BASE_URL}/bapi/futures/v1/friendly/future/copy-trade/lead-portfolio/detail?portfolioId=${portfolioId}`, {
            headers: buildHeaders(portfolioId),
        });

        if (!response.data?.nickname) {
            throw new Error(`Copy trading lead "${portfolioId}" not found or not accessible`);
        }

        return response.data;
    });

const fetchOrderHistory = (portfolioId: string) =>
    ofetch<CopyTradingOrderHistoryResponse>(`${BASE_URL}/bapi/futures/v1/friendly/future/copy-trade/lead-portfolio/order-history`, {
        method: 'POST',
        headers: buildHeaders(portfolioId),
        body: { portfolioId },
    });

export const route: Route = {
    path: '/copy-trading/lead/:portfolioId',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/binance/copy-trading/lead/5075281354358777856',
    parameters: {
        portfolioId: 'Copy trading lead portfolio ID, from the lead-details URL',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['www.binance.com/:lang/copy-trading/lead-details/:portfolioId'],
            target: '/copy-trading/lead/:portfolioId',
        },
    ],
    name: 'Copy Trading Lead',
    description: `Latest trading records from a Binance Copy Trading lead trader.

The portfolio ID can be found in the lead-details URL: \`/copy-trading/lead-details/:portfolioId\``,
    maintainers: ['enpitsulin', 'DIYgod'],
    handler,
};

async function handler(ctx) {
    const portfolioId = ctx.req.param('portfolioId');

    const limit = Math.trunc(Number(ctx.req.query('limit') ?? '10'));
    const pageSize = Number.isNaN(limit) || limit <= 0 ? 10 : limit;

    const detail: CopyTradingDetail = await fetchDetail(portfolioId);

    const orderHistoryResponse = await fetchOrderHistory(portfolioId);

    if (orderHistoryResponse.code !== '000000' || orderHistoryResponse.success === false) {
        throw new Error(orderHistoryResponse.message || 'Failed to fetch Binance Copy Trading order history');
    }

    const orders = orderHistoryResponse.data?.list ?? [];
    const leadDetailsUrl = `${BASE_URL}/zh-CN/copy-trading/lead-details/${portfolioId}`;

    const item = orders.slice(0, pageSize).map((order, index) => ({
        title: buildOrderTitle(order),
        link: `${leadDetailsUrl}#${order.orderTime}-${index}`,
        guid: `${portfolioId}-${order.orderTime}-${index}`,
        pubDate: parseDate(order.orderTime),
        category: [getActionLabel(order)],
        description: buildOrderDescription(order),
    }));

    ctx.set('json', {
        detail,
        orderHistoryResponse,
    });

    return {
        title: `${detail.nickname} - Binance Copy Trading`,
        link: leadDetailsUrl,
        description: detail.description || undefined,
        image: detail.avatarUrl || undefined,
        icon: detail.avatarUrl || undefined,
        logo: detail.avatarUrl || undefined,
        item,
        allowEmpty: true,
    };
}
