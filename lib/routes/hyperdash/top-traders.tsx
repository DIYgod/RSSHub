import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';

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
            source: ['hyperdash.com/', 'hyperdash.com/leaderboard'],
        },
    ],
    name: 'Top Traders',
    maintainers: ['pseudoyu'],
    handler,
    description: 'Get the latest top traders data from HyperDash',
};

async function handler() {
    const traders = await fetchTopTraders();

    const items = traders.map((trader) => {
        const title = trader.address;
        const description = renderToString(
            <>
                <h3>Trader #{trader.rank}</h3>
                <p>
                    <strong>Account Value:</strong> {formatCurrency(trader.accountValue)}
                </p>
                <h4>30-day Performance</h4>
                <p>
                    <strong>Net PnL:</strong> {formatPnL(trader.netPnl)}
                </p>
                <p>
                    <strong>Gross PnL:</strong> {formatPnL(trader.grossPnl)}
                </p>
                <p>
                    <strong>Funding PnL:</strong> {formatPnL(trader.fundingPnl)}
                </p>
                <p>
                    <strong>Fees:</strong> {formatCurrency(trader.totalFees)}
                </p>
                <p>
                    <strong>Volume:</strong> {formatCurrency(trader.volume)}
                </p>
                <p>
                    <strong>Trades:</strong> {trader.tradeCount} ({trader.winningTrades} winning, {trader.losingTrades} losing)
                </p>
            </>
        );

        return {
            title,
            description,
            link: `https://hyperdash.com/trader/${trader.address}`,
            guid: trader.address,
        };
    });

    return {
        title: 'HyperDash Top Traders',
        link: 'https://hyperdash.com/leaderboard',
        description: 'Top performing traders on HyperDash - 30-day profit and loss leaderboard',
        sortItems: false,
        item: items,
        language: 'en' as const,
    };
}
