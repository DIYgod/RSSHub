import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.chaincatcher.com';

export const route: Route = {
    path: '/',
    categories: ['new-media'],
    example: '/chaincatcher',
    radar: [
        {
            source: ['chaincatcher.com/'],
            target: '',
        },
    ],
    name: '首页',
    maintainers: ['TonyRL'],
    handler,
    url: 'chaincatcher.com/',
};

async function handler() {
    const response = await ofetch<{
        result: number;
        message: string;
        data: { items: Array<{ title: string; url: string; content: string; releaseTimeStamp: number; keywords?: string }> };
    }>('https://api.chaincatcher.com/v1/open-api/news-flash', {
        responseType: 'json',
        query: { page: 1, size: 20, lang: 'zh-CN' },
    });
    if (!response.result) {
        throw new Error(`ChainCatcher API: ${response.message}`);
    }
    const items = response.data.items.map((item) => ({
        title: item.title,
        link: item.url,
        description: item.content,
        pubDate: parseDate(item.releaseTimeStamp),
        category: item.keywords?.split(',').filter(Boolean),
    }));

    return {
        title: '链捕手ChainCatcher — 专业的区块链技术研究与资讯平台-Chain Catcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: rootUrl,
        item: items,
    };
}
