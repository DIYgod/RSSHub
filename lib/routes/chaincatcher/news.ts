import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const rootUrl = 'https://www.chaincatcher.com';

export const route: Route = {
    path: '/news',
    categories: ['new-media'],
    example: '/chaincatcher/news',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['chaincatcher.com/news', 'chaincatcher.com/'],
        },
    ],
    name: '快讯',
    maintainers: ['TonyRL'],
    handler,
    url: 'chaincatcher.com/news',
};

async function handler() {
    const response = await ofetch<{
        result: number;
        message: string;
        data: { items: Array<{ title: string; url: string; content: string; releaseTimeStamp: number; keywords?: string }> };
    }>('https://api.chaincatcher.com/v1/open-api/news-flash', {
        responseType: 'json',
        query: { type: 'flash', page: 1, size: 20, lang: 'zh-CN' },
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
        title: '最新资讯-ChainCatcher',
        description: '链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。',
        image: `${rootUrl}/logo.png`,
        link: `${rootUrl}/news`,
        item: items,
    };
}
