import { Route, type DataItem } from '@/types';

import { camelcaseKeys } from '@/utils/camelcase-keys';
import ofetch from '@/utils/ofetch';
import { renderItemActionToHTML } from '@rss3/sdk';

export const route: Route = {
    path: '/:account/:network?/:tag?',
    categories: ['social-media'],
    example: '/rss3/vitalik.eth',
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
            default: 'all',
            options: [
                {
                    value: 'all',
                    label: 'All',
                },
                {
                    value: 'arbitrum',
                    label: 'Arbitrum',
                },
                {
                    value: 'arweave',
                    label: 'Arweave',
                },
                {
                    value: 'avax',
                    label: 'Avax',
                },
                {
                    value: 'base',
                    label: 'Base',
                },
                {
                    value: 'binance-smart-chain',
                    label: 'Binance Smart Chain',
                },
                {
                    value: 'crossbell',
                    label: 'Crossbell',
                },
                {
                    value: 'ethereum',
                    label: 'Ethereum',
                },
                {
                    value: 'farcaster',
                    label: 'Farcaster',
                },
                {
                    value: 'gnosis',
                    label: 'Gnosis',
                },
                {
                    value: 'linea',
                    label: 'Linea',
                },
                {
                    value: 'optimism',
                    label: 'Optimism',
                },
                {
                    value: 'polygon',
                    label: 'Polygon',
                },
                {
                    value: 'vsl',
                    label: 'VSL',
                },
            ],
        },
        tag: {
            description: 'Retrieve activities from the specified tag.',
            default: 'all',
            options: [
                {
                    value: 'all',
                    label: 'All',
                },
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
            ...(network && network !== 'all' && { network }),
            ...(tag && tag !== 'all' && { tag }),
        })}`
    );

    return {
        title: `${account} activities`,
        link: 'https://rss3.io',
        item: data.map((item) => {
            const content = renderItemActionToHTML(camelcaseKeys(item.actions));

            const description = `New ${item.tag} ${item.type} action on ${item.network}<br /><br />From: ${item.from}<br/>To: ${item.to}`;
            return {
                title: `New ${item.tag} ${item.type} action on ${item.network}`,
                description: content ?? description,
                link: item.actions?.[0]?.related_urls?.[0],
                guid: item.id,
                author: [
                    {
                        name: item.owner,
                        avatar: `https://cdn.stamp.fyi/avatar/eth:${item.owner}`,
                    },
                ],

                _extra: { raw: item },
            } as DataItem;
        }),
    };
}
