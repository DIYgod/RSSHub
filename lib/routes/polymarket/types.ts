// API Constants
export const GAMMA_API = 'https://gamma-api.polymarket.com';
export const DATA_API = 'https://data-api.polymarket.com';

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
    conditionId: string;
    size: number;
    avgPrice: number;
    currentValue: number;
    cashPnl: number;
    percentPnl: number;
    curPrice: number;
    title?: string;
    slug?: string;
    eventSlug?: string;
    outcome?: string;
    outcomeIndex?: number;
    icon: string;
    endDate?: string;
}

export interface Activity {
    timestamp: number;
    type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION' | 'MAKER_REBATE';
    size?: number;
    usdcSize?: number;
    price?: number;
    side?: 'BUY' | 'SELL';
    outcomeIndex?: number;
    title?: string;
    slug?: string;
    eventSlug?: string;
    outcome?: string;
    icon?: string;
    transactionHash?: string;
    name?: string;
    pseudonym?: string;
}

export interface LeaderboardEntry {
    rank: string;
    proxyWallet: string;
    userName?: string;
    vol: number;
    pnl: number;
    profileImage?: string;
    xUsername?: string;
    verifiedBadge?: boolean;
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
