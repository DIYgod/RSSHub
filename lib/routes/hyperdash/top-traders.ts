import path from 'node:path';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';

import { fetchTopTraders, formatCurrency, formatPnL } from './utils';

export const route: Route = {
    path: '/top-traders',
    categories: ['finance'],
    example: '/hyperdash/top-traders',
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
            source: ['hyperdash.info/'],
        },
    ],
    name: 'Top Traders',
    maintainers: ['pseudoyu'],
    handler,
    description: 'Get the latest top traders data from HyperDash',
};

async function handler() {
    const traders = await fetchTopTraders();

    const items = traders.map((trader, index) => {
        const rank = index + 1;

        const title = trader.address;

        const description = art(path.join(__dirname, 'templates/description.art'), {
            rank,
            address: trader.address,
            accountValue: formatCurrency(trader.account_value),
            mainPosition: {
                coin: trader.main_position.coin,
                value: formatCurrency(trader.main_position.value),
                side: trader.main_position.side,
            },
            directionBias: trader.direction_bias !== null && trader.direction_bias !== undefined ? trader.direction_bias.toFixed(2) + '%' : 'N/A',
            pnl: {
                day: {
                    value: formatPnL(trader.perp_day_pnl),
                },
                week: {
                    value: formatPnL(trader.perp_week_pnl),
                },
                month: {
                    value: formatPnL(trader.perp_month_pnl),
                },
                alltime: {
                    value: formatPnL(trader.perp_alltime_pnl),
                },
            },
        });

        const baseTime = new Date();
        const orderTimestamp = new Date(baseTime.getTime() - index * 1000); // Each item 1 second apart

        return {
            title,
            description,
            link: `https://hyperdash.info/trader/${trader.address}`,
            pubDate: parseDate(orderTimestamp.toISOString()),
            guid: trader.address,
        };
    });

    return {
        title: 'HyperDash Top Traders',
        link: 'https://hyperdash.info/',
        description: 'Top performing traders on HyperDash - real-time cryptocurrency derivatives trading analytics',
        item: items,
        language: 'en' as const,
    };
}
