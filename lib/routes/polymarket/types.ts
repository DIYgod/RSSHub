// API Constants
export const GAMMA_API = 'https://gamma-api.polymarket.com';
export const DATA_API = 'https://data-api.polymarket.com/v2';

// Common Interfaces

export interface Market {
    id: string;
    question: string;
    slug?: string;
    outcomes?: string;
    outcomePrices?: string;
    volume?: string;
    image?: string;
    oneDayPriceChange?: number;
    endDate?: string;
    startDate?: string;
}

export interface Event {
    id: string;
    title: string;
    slug: string;
    description?: string;
    volume?: number;
    image?: string;
    startDate?: string;
    endDate?: string;
    liquidity?: number;
    live?: boolean;
    markets?: Market[];
    tags?: Array<{ label?: string }>;
}

export interface Series {
    id: string;
    title: string;
    slug: string;
    description?: string;
    image?: string;
    volume?: number;
    liquidity?: number;
    startDate?: string;
    createdAt?: string;
    updatedAt?: string;
    events?: Event[];
}

export interface PublicProfile {
    name?: string;
    pseudonym?: string;
    bio?: string;
    proxyWallet?: string;
    profileImage?: string;
}

export interface Position {
    token_id: string;
    condition_id: string;
    current_size: number;
    avg_price: number;
    current_value: number;
    unrealized_pnl: number;
    percent_pnl: number;
    current_price: number;
    title?: string;
    slug?: string;
    event_slug?: string;
    outcome?: string;
    outcome_index?: number;
    icon: string;
    end_date?: string;
}

export interface Activity {
    token_id?: string;
    timestamp: number;
    type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION' | 'MAKER_REBATE';
    size?: number;
    usdc_size?: number;
    price?: number;
    side?: 'BUY' | 'SELL';
    outcome_index?: number;
    title?: string;
    slug?: string;
    event_slug?: string;
    outcome?: string;
    icon?: string;
    transaction_hash?: string;
    name?: string;
    pseudonym?: string;
}

export interface LeaderboardEntry {
    rank: number;
    user_id: string;
    user_name?: string;
    volume: number;
    pnl: number;
    profile_image?: string;
    x_username?: string;
    verified?: boolean;
}

export interface EventsPagination {
    data: Event[];
    pagination?: {
        hasMore: boolean;
        totalResults: number;
    };
}

export interface SearchResult {
    events?: Event[];
    tags?: Array<{ id: string; label: string; slug: string; event_count?: number }>;
}
