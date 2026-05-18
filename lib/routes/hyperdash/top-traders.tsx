import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import { parseDate } from '@/utils/parse-date';

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

        const accountValue = formatCurrency(trader.account_value);
        const mainPosition = {
            coin: trader.main_position.coin,
            value: formatCurrency(trader.main_position.value),
            side: trader.main_position.side,
        };
        const directionBias = trader.direction_bias !== null && trader.direction_bias !== undefined ? trader.direction_bias.toFixed(2) + '%' : 'N/A';
        const pnl = {
            day: formatPnL(trader.perp_day_pnl),
            week: formatPnL(trader.perp_week_pnl),
            month: formatPnL(trader.perp_month_pnl),
            alltime: formatPnL(trader.perp_alltime_pnl),
        };
        const description = renderToString(
            <>
                <h3>Trader #{rank}</h3>
                <p>
                    <strong>Address:</strong> <code>{trader.address}</code>
                </p>
                <p>
                    <strong>Account Value:</strong> {accountValue}
                </p>
                <h4>Main Position</h4>
                <p>
                    <strong>Coin:</strong> {mainPosition.coin}
                </p>
                <p>
                    <strong>Position Value:</strong> {mainPosition.value}
                </p>
                <p>
                    <strong>Side:</strong> {mainPosition.side}
                </p>
                <p>
                    <strong>Direction Bias:</strong> {directionBias}
                </p>
                <h4>PnL Performance</h4>
                <table>
                    <tr>
                        <th>Period</th>
                        <th>PnL</th>
                    </tr>
                    <tr>
                        <td>Day</td>
                        <td>{pnl.day}</td>
                    </tr>
                    <tr>
                        <td>Week</td>
                        <td>{pnl.week}</td>
                    </tr>
                    <tr>
                        <td>Month</td>
                        <td>{pnl.month}</td>
                    </tr>
                    <tr>
                        <td>All-time</td>
                        <td>{pnl.alltime}</td>
                    </tr>
                </table>
            </>
        );

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
