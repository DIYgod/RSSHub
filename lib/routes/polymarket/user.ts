import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

import type { Activity, PublicProfile } from './types';
import { DATA_API, GAMMA_API } from './types';

export const route: Route = {
    path: '/user/:address',
    categories: ['finance'],
    example: '/polymarket/user/0x7c3db723f1d4d8cb9c550095203b686cb11e5c6b',
    parameters: {
        address: 'Wallet address (0x...)',
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
    maintainers: ['heqi201255'],
    handler,
};

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

    const displayName = profile?.name || profile?.pseudonym || address;

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
        description: profile?.bio,
    };
}
