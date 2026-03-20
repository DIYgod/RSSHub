import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/user/:address',
    categories: ['finance'],
    example: '/polymarket/user/0x7c3db723f1d4d8cb9c550095203b686cb11e5c6b',
    parameters: {
        address: {
            description: 'Wallet address (0x...)',
            required: true,
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
    name: 'User Activity',
    url: 'polymarket.com',
    maintainers: ['heki'],
    handler,
};

const GAMMA_API = 'https://gamma-api.polymarket.com';
const DATA_API = 'https://data-api.polymarket.com';

interface Activity {
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

interface PublicProfile {
    name?: string;
    pseudonym?: string;
    bio?: string;
    proxyWallet?: string;
    profileImage?: string;
}

async function handler(ctx) {
    const address = ctx.req.param('address');

    // Fetch profile and activity
    let profile: PublicProfile | null = null;
    let activity: Activity[] = [];

    try {
        profile = await ofetch<PublicProfile>(`${GAMMA_API}/public-profile`, {
            query: { address },
        });
    } catch {
        // Profile not found, continue without it
    }

    try {
        activity = await ofetch<Activity[]>(`${DATA_API}/activity`, {
            query: {
                user: address,
                limit: 50,
                sortBy: 'TIMESTAMP',
                sortDirection: 'DESC',
            },
        });
    } catch {
        // Activity not found, continue with empty array
    }

    const displayName = profile?.name || profile?.pseudonym || activity[0]?.name || activity[0]?.pseudonym || address.slice(0, 8) + '...' + address.slice(-4);

    const items = activity.map((act) => {
        const typeEmoji: Record<string, string> = {
            TRADE: '💱',
            SPLIT: '✂️',
            MERGE: '🔗',
            REDEEM: '💰',
            REWARD: '🎁',
            CONVERSION: '🔄',
            MAKER_REBATE: '💵',
        };

        const typeLabel = `${typeEmoji[act.type] || '📝'} ${act.type}`;

        return {
            title: act.title ? `${act.title} - ${act.outcome || `Outcome ${act.outcomeIndex}`}` : typeLabel,
            description: `
                <p><strong>Type:</strong> ${typeLabel}</p>
                ${act.side ? `<p><strong>Side:</strong> ${act.side}</p>` : ''}
                ${act.price === undefined ? '' : `<p><strong>Price:</strong> $${act.price.toFixed(4)}</p>`}
                ${act.size === undefined ? '' : `<p><strong>Size:</strong> ${act.size.toLocaleString()}</p>`}
                ${act.usdcSize === undefined ? '' : `<p><strong>USDC:</strong> $${act.usdcSize.toLocaleString()}</p>`}
                ${act.icon ? `<img src="${act.icon}" alt="${act.title || 'Market'}" style="max-width: 100%;">` : ''}
            `,
            link: act.eventSlug ? `https://polymarket.com/event/${act.eventSlug}` : act.slug ? `https://polymarket.com/event/${act.slug}` : 'https://polymarket.com',
            pubDate: parseDate(act.timestamp * 1000),
            author: displayName,
        };
    });

    return {
        title: `Polymarket User - ${displayName}`,
        link: `https://polymarket.com/portfolio?address=${address}`,
        item: items,
        description: profile?.bio || undefined,
    };
}
