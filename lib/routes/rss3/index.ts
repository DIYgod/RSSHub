import { Route } from '@/types';

import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/:account/:network?/:tag?',
    categories: ['social-media'],
    example: '/rss3/diygod.eth',
    name: 'Account Activities',
    maintainers: ['DIYgod'],
    url: 'docs.rss3.io/api-reference#tag/decentralized/GET/decentralized/%7Baccount%7D',
    handler,
    description: 'Retrieve the activities associated with a specified account in the decentralized system.',
    parameters: {
        account: {
            description: 'Retrieve activities from the specified account. This account is a unique identifier within the decentralized system.',
        },
        network: {
            description: 'Retrieve activities from the specified network.',
            options: [
                {
                    value: 'arbitrum',
                    label: 'arbitrum',
                },
                {
                    value: 'arweave',
                    label: 'arweave',
                },
                {
                    value: 'avax',
                    label: 'avax',
                },
                {
                    value: 'base',
                    label: 'base',
                },
                {
                    value: 'binance-smart-chain',
                    label: 'binance-smart-chain',
                },
                {
                    value: 'crossbell',
                    label: 'crossbell',
                },
                {
                    value: 'ethereum',
                    label: 'ethereum',
                },
                {
                    value: 'farcaster',
                    label: 'farcaster',
                },
                {
                    value: 'gnosis',
                    label: 'gnosis',
                },
                {
                    value: 'linea',
                    label: 'linea',
                },
                {
                    value: 'optimism',
                    label: 'optimism',
                },
                {
                    value: 'polygon',
                    label: 'polygon',
                },
                {
                    value: 'vsl',
                    label: 'vsl',
                },
            ],
        },
        tag: {
            description: 'Retrieve activities from the specified tag.',
            options: [
                {
                    value: 'collectible',
                    label: 'collectible',
                },
                {
                    value: 'exchange',
                    label: 'exchange',
                },
                {
                    value: 'metaverse',
                    label: 'metaverse',
                },
                {
                    value: 'rss',
                    label: 'rss',
                },
                {
                    value: 'social',
                    label: 'social',
                },
                {
                    value: 'transaction',
                    label: 'transaction',
                },
                {
                    value: 'unknown',
                    label: 'unknown',
                },
            ],
        },
    },
};

async function handler(ctx) {
    const { account, network, tag } = ctx.req.param();

    const { data } = await ofetch(
        `https://gi.rss3.io/decentralized/${account}?${new URLSearchParams({
            limit: '20',
            ...(network && { network }),
            ...(tag && { tag }),
        })}`
    );

    return {
        title: `${account} activities`,
        link: 'https://rss3.io',
        item: data.map((item) => ({
            title: `${item.tag} ${item.type} action on ${item.network}`,
            description: `From: ${item.from}<br/>To: ${item.to}`,
            link: item.actions?.[0]?.related_urls?.[0],
            guid: item.id,
            author: [
                {
                    name: item.owner,
                    avatar: `https://cdn.stamp.fyi/avatar/eth:${item.owner}`,
                },
            ],
        })),
    };
}
