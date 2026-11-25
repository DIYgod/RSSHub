import { escape } from 'entities/escape';

import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';

import type { Position, PublicProfile } from './types';
import { DATA_API, GAMMA_API } from './types';

export const route: Route = {
    path: '/positions/:address',
    categories: ['finance'],
    example: '/polymarket/positions/0x7c3db723f1d4d8cb9c550095203b686cb11e5c6b',
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
    name: 'User Positions',
    url: 'polymarket.com',
    maintainers: ['heqi201255'],
    handler,
};

async function handler(ctx): Promise<Data> {
    const address = ctx.req.param('address');

    // Fetch profile and positions
    let profile: PublicProfile | undefined;

    try {
        profile = await ofetch<PublicProfile>(`${GAMMA_API}/public-profile`, {
            query: { address },
        });
    } catch {
        // Profile not found, continue without it
    }

    const { data: positions } = await ofetch<{ data: Position[] }>(`${DATA_API}/positions`, {
        query: {
            user: address,
            limit: 50,
            sortBy: 'CURRENT_VALUE',
            sortDirection: 'DESC',
        },
    });

    const displayName = profile?.name || profile?.pseudonym || address;

    const items = positions.map((pos) => ({
        guid: pos.token_id,
        title: pos.title || `Position #${pos.condition_id.slice(0, 8)}`,
        description: `
            <p><strong>Outcome:</strong> ${escape(pos.outcome || `#${pos.outcome_index}`)}</p>
            <p><strong>Size:</strong> ${pos.current_size.toLocaleString()}</p>
            <p><strong>Avg Price:</strong> $${pos.avg_price.toFixed(4)}</p>
            <p><strong>Current Price:</strong> $${pos.current_price.toFixed(4)}</p>
            <p><strong>Current Value:</strong> $${pos.current_value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>PnL:</strong> ${pos.unrealized_pnl >= 0 ? '+' : ''}$${pos.unrealized_pnl.toFixed(2)} (${pos.percent_pnl >= 0 ? '+' : ''}${pos.percent_pnl.toFixed(1)}%)</p>
            <img src="${escape(pos.icon)}" alt="${escape(pos.title || 'Position')}" style="max-width: 100%;">
        `,
        link: pos.event_slug ? `https://polymarket.com/event/${pos.event_slug}` : pos.slug ? `https://polymarket.com/event/${pos.slug}` : 'https://polymarket.com',
        author: displayName,
    }));

    return {
        title: `Polymarket Positions - ${displayName}`,
        link: `https://polymarket.com/portfolio?address=${address}`,
        item: items,
        language: 'en',
    };
}
