import { ofetch } from 'ofetch';

export interface TraderData {
    address: string;
    account_value: number;
    main_position: {
        coin: string;
        value: number;
        side: 'LONG' | 'SHORT';
    };
    direction_bias: number;
    perp_day_pnl: number;
    perp_week_pnl: number;
    perp_month_pnl: number;
    perp_alltime_pnl: number;
}

export async function fetchTopTraders(): Promise<TraderData[]> {
    const apiUrl = 'https://hyperdash.info/api/hyperdash/top-traders-cached';

    const traders: TraderData[] = await ofetch(apiUrl, {
        headers: {
            'x-api-key': 'hyperdash_public_7vN3mK8pQ4wX2cL9hF5tR1bY6gS0jD',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
    });

    return traders;
}

export function formatCurrency(value: number | null): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    if (Math.abs(value) >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1e3) {
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
