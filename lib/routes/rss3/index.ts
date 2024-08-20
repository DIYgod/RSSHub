/* eslint-disable default-case */
import { Route, type DataItem } from '@/types';

import { camelcaseKeys } from '@/utils/camelcase-keys';
import ofetch from '@/utils/ofetch';
import type { Action } from '@rss3/sdk';
import type { GetRSS3DataMetadata } from './interfaces/metadata';

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
            const content = parseItemActionToContent(camelcaseKeys(item.actions));

            const description = `New ${item.tag} ${item.type} action on ${item.network}<br /><br />From: ${item.from}<br/>To: ${item.to}`;
            return {
                title: `New ${item.tag} ${item.type} action on ${item.network}`,
                description: content ? `${description}<br /><br />${content}` : description,
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
            case 'collectible':
                joint += renderCollectibleTagContent(action);
                break;
            case 'metaverse':
                joint += renderMetaverseTagContent(action);

                break;
            case 'exchange':
                joint += renderExchange(action);
                break;
            case 'transaction':
                joint += renderTransaction(action);
                break;
        }

        joint += '<hr />';
    }

    return joint;
}

const renderTransaction = (action: Action) => {
    let joint = '';
    const { type } = action;
    const tag = 'transaction';
    switch (type) {
        case 'transfer':
        case 'burn':
        case 'mint':
        case 'approval': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Transaction ${type.toUpperCase().at(0) + type.slice(1)}</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p><strong>Standard:</strong> ${metadata.standard}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Decimals:</strong> ${metadata.decimals}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
            ]);
            break;
        }
        case 'event': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([/* html */ `<h4>Transaction Event</h4>`, /* html */ `<p><strong>Block Hash:</strong> ${metadata.block.hash}</p>`, /* html */ `<p><strong>Transaction Hash:</strong> ${metadata.transaction.hash}</p>`]);
            break;
        }
        case 'bridge': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Transaction Bridge</h4>`,
                /* html */ `<p><strong>Action:</strong> ${metadata.action}</p>`,
                /* html */ `<p><strong>Source Network:</strong> ${metadata.sourceNetwork}</p>`,
                /* html */ `<p><strong>Target Network:</strong> ${metadata.targetNetwork}</p>`,
                metadata.token && /* html */ `<p><strong>Token name:</strong> ${metadata.token.name}</p>`,
                metadata.token && /* html */ `<p><strong>Token Symbol:</strong> ${metadata.token.symbol}</p>`,
                metadata.token && /* html */ `<p><strong>Token Value:</strong> ${metadata.token.value}</p>`,
                metadata.token && /* html */ `<p><strong>Token Address:</strong> ${metadata.token.address}</p>`,
            ]);
            break;
        }
    }

    return buildSectionFooterHTML(joint, action);
};

const renderExchange = (action: Action) => {
    let joint = '';
    const { type } = action;
    const tag = 'exchange';
    switch (type) {
        case 'liquidity': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Exchange Liquidity</h4>`,
                /* html */ `<p><strong>Action:</strong> ${metadata.action}</p>`,
                /* html */ `<p>
              <table>
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Value</th>
                    <th>Name</th>
                    <th>Symbol</th>
                    <th>Decimals</th>
                    <th>Standard</th>
                  </tr>
                </thead>
                <tbody>
                  ${metadata.tokens.map(
                      (token) => /* html */ `<tr>
                    <td>${token.address}</td>
                    <td>${token.value}</td>
                    <td>${token.name}</td>
                    <td>${token.symbol}</td>
                    <td>${token.decimals}</td>
                    <td>${token.standard}</td>
                  </tr>`
                  )}
                </tbody>
            </table>
          </p>`,
            ]);
            break;
        }
        case 'staking': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Exchange Liquidity</h4>`,
                /* html */ `<p><strong>Action:</strong> ${metadata.action}</p>`,
                metadata.token &&
                    /* html */ `<p>
               
             <strong>Token:</strong>
             <ul>
              <li><strong>Address:</strong> ${metadata.token.address}</li>
              <li><strong>Value:</strong> ${metadata.token.value}</li>
              <li><strong>Name:</strong> ${metadata.token.name}</li>
              <li><strong>Symbol:</strong> ${metadata.token.symbol}</li>
              <li><strong>Decimals:</strong> ${metadata.token.decimals}</li>
              <li><strong>Standard:</strong> ${metadata.token.standard}</li>
             </ul>
          </p>`,
            ]);
            break;
        }
        case 'swap': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Exchange Swap</h4>`,
                /* html */ metadata.from && `<p><strong>From:</strong> ${metadata.from.address}</p>`,
                /* html */ metadata.to && `<p><strong>To:</strong> ${metadata.to?.address}</p>`,
            ]);
        }
    }

    return buildSectionFooterHTML(joint, action);
};

const renderMetaverseTagContent = (action: Action) => {
    let joint = '';
    const { from, to, type } = action;
    const tag = 'metaverse';
    switch (type) {
        case 'burn': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Metaverse Burn</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);
            break;
        }
        case 'trade': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Metaverse Trade</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);
            break;
        }
        case 'mint':
            {
                const metadata = extractMetadata(tag, type, action);
                if (!metadata) {
                    break;
                }
                joint += buildHTML([
                    /* html */ `<h4>Metaverse Mint</h4>`,
                    /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                    /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                    /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                    /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                    /* html */ `<p>${from} --> ${to}</p>`,
                ]);
            }
            break;
        case 'transfer': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Metaverse Transfer</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);
        }
    }

    return buildSectionFooterHTML(joint, action);
};
const renderCollectibleTagContent = (action: Action) => {
    let joint = '';
    const { from, to, type } = action;
    const tag = 'collectible';
    switch (type) {
        case 'approval': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Collectible Approval</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);

            break;
        }
        case 'burn': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Collectible Burn</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);
            break;
        }
        case 'trade': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Collectible Trade</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);
            break;
        }
        case 'mint':
            {
                const metadata = extractMetadata(tag, type, action);
                if (!metadata) {
                    break;
                }
                joint += buildHTML([
                    /* html */ `<h4>Collectible Mint</h4>`,
                    /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                    /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                    /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                    /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                    /* html */ `<p>${from} --> ${to}</p>`,
                ]);
            }
            break;
        case 'transfer': {
            const metadata = extractMetadata(tag, type, action);
            if (!metadata) {
                break;
            }
            joint += buildHTML([
                /* html */ `<h4>Collectible Transfer</h4>`,
                /* html */ `<p><strong>Name:</strong> ${metadata.name}</p>`,
                /* html */ `<p><strong>Address:</strong> ${metadata.address}</p>`,
                /* html */ `<p><strong>Symbol:</strong> ${metadata.symbol}</p>`,
                /* html */ `<p><strong>Value:</strong> ${metadata.value}</p>`,
                /* html */ `<p>${from} --> ${to}</p>`,
            ]);
        }
    }

    return buildSectionFooterHTML(joint, action);
};

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
                metadata.target && /* html*/ `<p><strong>Comment Target:</strong> <a href="${metadata.targetUrl}" target="_blank">${metadata.target.title || metadata.targetUrl}</a></p>`,
            ]);

            break;
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
    return arr.filter(Boolean).join('\n');
}

const buildSectionFooterHTML = (string: string, action: Action) =>
    buildHTML([
        string,
        !!action.platform && `<p><strong>Platform:</strong> ${action.platform}</p>`,

        /* html */ `<p><strong>Related URLs:</strong>
        <ul><li>${action.relatedUrls.map((url) => `<a href="${url}" target="_blank">${url}</a>`).join('</li><li>')}</li></ul></p>`,
    ]);
