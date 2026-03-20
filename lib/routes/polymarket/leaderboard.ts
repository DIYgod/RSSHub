import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/leaderboard/:category?/:timePeriod?',
    categories: ['finance'],
    example: '/polymarket/leaderboard',
    parameters: {
        category: {
            description: 'Market category: OVERALL, POLITICS, SPORTS, CRYPTO, CULTURE, MENTIONS, WEATHER, ECONOMICS, TECH, FINANCE',
            default: 'OVERALL',
        },
        timePeriod: {
            description: 'Time period: DAY, WEEK, MONTH, ALL',
            default: 'DAY',
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Leaderboard',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

const API_BASE = 'https://data-api.polymarket.com';

interface LeaderboardEntry {
    rank: string;
    proxyWallet: string;
    userName?: string;
    vol?: number;
    pnl?: number;
    profileImage?: string;
    xUsername?: string;
    verifiedBadge?: boolean;
}

async function handler(ctx) {
    const category = ctx.req.param('category') || 'OVERALL';
    const timePeriod = ctx.req.param('timePeriod') || 'DAY';

    const data = await ofetch<LeaderboardEntry[]>(`${API_BASE}/v1/leaderboard`, {
        query: {
            category,
            timePeriod,
            orderBy: 'PNL',
            limit: 50,
        },
    });

    const items = data.map((entry) => ({
        title: `#${entry.rank} ${entry.userName || entry.proxyWallet.slice(0, 8) + '...'}`,
        description: `
            <p><strong>Rank:</strong> #${entry.rank}</p>
            <p><strong>PnL:</strong> $${Number(entry.pnl || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Volume:</strong> $${Number(entry.vol || 0).toLocaleString()}</p>
            ${entry.xUsername ? `<p><strong>X:</strong> @${entry.xUsername}</p>` : ''}
            ${entry.verifiedBadge ? '<p>✅ Verified</p>' : ''}
            ${entry.profileImage ? `<img src="${entry.profileImage}" alt="${entry.userName || 'Trader'}" style="max-width: 100px; border-radius: 50%;">` : ''}
        `,
        link: `https://polymarket.com/portfolio?address=${entry.proxyWallet}`,
        author: entry.userName || entry.proxyWallet,
    }));

    const categoryName = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
    const periodName = timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1).toLowerCase();

    return {
        title: `Polymarket Leaderboard - ${categoryName} (${periodName})`,
        link: 'https://polymarket.com/leaderboard',
        item: items,
    };
}
