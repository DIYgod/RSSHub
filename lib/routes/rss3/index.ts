/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
import { Route } from '@/types';

import ofetch from '@/utils/ofetch';
import type { GetRSS3DataMetadata } from './interfaces/metadata';
import { join } from 'path';
import type { Action } from '@rss3/sdk';
import { camelcaseKeys } from '@/utils/camelcase-keys';

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
            const content = parseItemActionToContent(item.actions);
            const description = `New ${item.tag} ${item.type} action on ${item.network}<br /><br />From: ${item.from}<br/>To: ${item.to}`;
            return {
                title: `New ${item.tag} ${item.type} action on ${item.network}`,
                description,
                link: item.actions?.[0]?.related_urls?.[0],
                guid: item.id,
                author: [
                    {
                        name: item.owner,
                        avatar: `https://cdn.stamp.fyi/avatar/eth:${item.owner}`,
                    },
                ],
                content: content ? `${description}<br /><br />${content}` : description,
                raw: item,
            };
        }),
    };
}

function parseItemActionToContent(actions: Action[]): string | undefined {
    if (!actions) {
        return;
    }

    let joint = '';

    for (const action of actions) {
        const metadata = action.metadata;
        if (!metadata) {
            continue;
        }
        const { tag } = action;
        switch (tag) {
            case 'social':
                joint += renderSocialTagContent(action);
                break;
            case 'rss':
                joint += renderRssTagContent(action);
                break;
        }
    }

    return joint;
}

const renderRssTagContent = (action: Action) => '';
// let joint = '';
// const { from, to, platform, type } = action;
// const tag = 'rss';
// switch (type) {
// }
const renderSocialTagContent = (action: Action) => {
    let joint = '';
    const { from, to, platform, type } = action;
    const tag = 'social';
    switch (type) {
        case 'profile': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }

            joint += buildHTML([
                `<p><strong>Name:</strong> ${metadata.name}</p>`,
                `<p><strong>Handle:</strong> ${metadata.handle}</p>`,
                `<p><strong>Bio:</strong> ${metadata.bio}</p>`,
                `<p><strong>Platform:</strong> ${platform}</p>`,
                metadata.imageUri && `<img src="https://ipfs.io/ipfs/${metadata.imageUri.split('://')[1]}" alt="${metadata.name}" style="max-width:100%; height:auto;"/>`,
            ]);
            break;
        }
        case 'mint': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([`<h4>Social Mint</h4>`, `<p><strong>Title:</strong> ${metadata.title}</p>`, `<p>${from} --> ${to}</p>`]);
            break;
        }
        case 'delete': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([`<h4>Social Delete</h4>`, `<p><strong>Title:</strong> ${metadata.title}</p>`]);
            break;
        }
        case 'post': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html*/ `<h4>Social Post</h4>`,
                /* html*/ `<p><strong>Title:</strong> ${metadata.title}</p>`,
                /* html*/ `<p><strong>Author:</strong> ${metadata.handle}</p>`,
                /* html*/ `<p><strong>Content:</strong> <pre>${metadata.body}</pre></p>`,
                /* html*/ `<p><strong>Platform:</strong> ${platform}</p>`,
            ]);
            break;
        }
        case 'comment': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html*/ `<h4>Social Comment</h4>`,
                /* html*/ `<p><strong>Comment Anchor:</strong><a href="${metadata.authorUrl}" target="_blank">${metadata.handle}</a></p>`,
                metadata.target && /* html*/ `<p><strong>Comment Target:</strong> <a href="${metadata.targetUrl}" target="_blank">${metadata.target.title}</a></p>`,
            ]);
        }
        case 'reward':
        case 'revise':
        case 'proxy':
        case 'share':
            break;
    }

    return joint;
};

function extractMetadata<T1 extends string, T2 extends string>(tag: T1, type: T2, data: any): GetRSS3DataMetadata<T1, T2> | null {
    const metadata = data.metadata;
    if (!metadata) {
        return null;
    }
    return camelcaseKeys(data.metadata) as GetRSS3DataMetadata<T1, T2>;
}

function buildHTML(arr: (string | boolean | undefined | null)[]): string {
    return arr.filter(Boolean).join('\n') + '<br />';
}
