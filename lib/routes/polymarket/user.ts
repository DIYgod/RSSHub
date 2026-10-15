import { escape } from 'entities/escape';

import type { Data, Route } from '@/types';
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

async function handler(ctx): Promise<Data> {
    const address = ctx.req.param('address');

    // Fetch profile and activity
    let profile: PublicProfile | undefined;

    try {
        profile = await ofetch<PublicProfile>(`${GAMMA_API}/public-profile`, {
            query: { address },
        });
    } catch {
        // Profile not found, continue without it
    }

    const activity = await ofetch<Activity[]>(`${DATA_API}/activity`, {
        query: {
            user: address,
            limit: 50,
            sortBy: 'TIMESTAMP',
            sortDirection: 'DESC',
        },
    });

    const displayName = profile?.name || profile?.pseudonym || address;

    const items = activity.map((act) => {
        const typeEmoji = {
            TRADE: '💱',
            SPLIT: '✂️',
            MERGE: '🔗',
            REDEEM: '💰',
            REWARD: '🎁',
            CONVERSION: '🔄',
            MAKER_REBATE: '💵',
        } satisfies Record<Activity['type'], string>;

        const typeLabel = `${typeEmoji[act.type] || '📝'} ${act.type}`;

        return {
            guid: [address.toLowerCase(), act.transactionHash, act.asset, act.type, act.side, act.timestamp, act.size, act.price].join(':'),
            title: act.title ? `${act.title} - ${act.outcome || `Outcome ${act.outcomeIndex}`}` : typeLabel,
            description: `
                <p><strong>Type:</strong> ${escape(typeLabel)}</p>
                ${act.side ? `<p><strong>Side:</strong> ${escape(act.side)}</p>` : ''}
                ${act.price === undefined ? '' : `<p><strong>Price:</strong> $${act.price.toFixed(4)}</p>`}
                ${act.size === undefined ? '' : `<p><strong>Size:</strong> ${act.size.toLocaleString()}</p>`}
                ${act.usdcSize === undefined ? '' : `<p><strong>USDC:</strong> $${act.usdcSize.toLocaleString()}</p>`}
                ${act.icon ? `<img src="${escape(act.icon)}" alt="${escape(act.title || 'Market')}" style="max-width: 100%;">` : ''}
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
        language: 'en',
        description: profile?.bio,
    };
}
