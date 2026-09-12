import type { Context } from 'hono';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Data, Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/transactions/:address',
    categories: ['finance'],
    example: '/etherscan/transactions/0x283af0b28c62c092c9727f1ee09c02ca627eb7f5',
    parameters: {
        address: '地址',
    },
    features: {
        requireConfig: [
            {
                name: 'ETHERSCAN_API_KEY',
                description: 'Etherscan API key, can be obtained from https://etherscan.io/myapikey',
            },
        ],
    },
    name: '转账追踪',
    maintainers: ['Pretty9'],
    handler,
};

interface Transaction {
    hash: string;
    from: string;
    to: string;
    value: string;
    blockNumber: string;
    timeStamp: string;
}

type TxListResponse = { status: '1'; message: string; result: Transaction[] } | { status: '0'; message: string; result: string | Transaction[] };

async function handler(ctx: Context): Promise<Data> {
    if (!config.etherscan.apiKey) {
        throw new ConfigNotFoundError('Etherscan RSS is disabled due to the lack of ETHERSCAN_API_KEY');
    }

    const { address } = ctx.req.param();
    const limit = Number(ctx.req.query('limit') ?? 20);

    const response = await ofetch<TxListResponse>('https://api.etherscan.io/v2/api', {
        query: {
            chainid: 1,
            module: 'account',
            action: 'txlist',
            address,
            page: 1,
            offset: limit,
            sort: 'desc',
            apikey: config.etherscan.apiKey,
        },
    });

    if (response.status !== '1') {
        throw new Error(Array.isArray(response.result) ? response.message : response.result);
    }

    return {
        title: 'etherscan transactions',
        link: 'https://etherscan.io/',
        language: 'en',
        description: 'ethereum address transactions',
        item: response.result.map((item) => {
            const value = (Number(item.value) / 10 ** 18).toFixed(8);
            return {
                title: `TransactionHash: ${item.hash}`,
                description: `From: ${item.from} <br> To: ${item.to} <br> Value: ${value} <br> Block: ${item.blockNumber}`,
                link: `https://etherscan.io/tx/${item.hash}`,
                pubDate: parseDate(item.timeStamp, 'X'),
                guid: item.hash,
            };
        }),
    };
}
