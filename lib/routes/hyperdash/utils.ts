import ofetch from '@/utils/ofetch';

export interface TraderData {
    rank: number;
    address: string;
    accountValue: number;
    netPnl: number;
    grossPnl: number;
    fundingPnl: number;
    totalFees: number;
    volume: number;
    tradeCount: number;
    winningTrades: number;
    losingTrades: number;
}

export async function fetchTopTraders(): Promise<TraderData[]> {
    const response = await ofetch<{ data?: { pnlLeaderboard: { data: TraderData[] } }; errors?: Array<{ message: string }> }>('https://api.hyperdash.com/graphql', {
        method: 'POST',
        body: {
            query: `query PnlLeaderboard($category: PnlLeaderboardCategory!, $window: PnlLeaderboardWindow!, $pageSize: Int!) {
                pnlLeaderboard(category: $category, window: $window, page: 1, pageSize: $pageSize) {
                    data { rank address accountValue netPnl grossPnl fundingPnl totalFees volume tradeCount winningTrades losingTrades }
                }
            }`,
            variables: { category: 'all', window: 'd30', pageSize: 28 },
        },
    });
    if (response.errors?.length || !Array.isArray(response.data?.pnlLeaderboard?.data)) {
        throw new Error(`Hyperdash leaderboard API failed: ${response.errors?.map((error) => error.message).join('; ') || 'missing leaderboard data'}`);
    }
    return response.data.pnlLeaderboard.data;
}

export function formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    if (Math.abs(value) >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
}

export function formatPnL(value: number | null): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    const formatted = formatCurrency(value);
    return value >= 0 ? `+${formatted}` : formatted;
}
