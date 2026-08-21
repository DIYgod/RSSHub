import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/markets/:market?',
    categories: ['finance'],
    view: ViewType.Notifications,
    example: '/schwabnetwork/markets',
    parameters: {
        market: {
            description: '市场分类，留空为总览',
            options: [
                { label: '总览', value: '' },
                { label: '美国经济', value: 'us-economy' },
                { label: '波动性', value: 'volatility' },
                { label: '期权', value: 'options' },
                { label: '收益', value: 'earnings' },
                { label: '技术分析', value: 'technical-analysis' },
                { label: '美联储动向', value: 'fed-watch' },
                { label: '期货', value: 'futures' },
                { label: '国际市场', value: 'international-markets' },
                { label: '债券', value: 'bonds' },
                { label: 'IPO与SPAC', value: 'ipos-spac' },
                { label: 'ETF', value: 'etfs' },
            ],
            default: '',
        },
    },
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
            source: ['schwabnetwork.com/markets/:market?'],
            target: 'schwabnetwork/markets/:market?',
        },
    ],
    name: '市场新闻',
    maintainers: ['hutianyu2006'],
    handler,
    url: 'schwabnetwork.com/markets',
};

async function handler(ctx) {
    const market = ctx.params?.market ?? '';
    const url = `https://www.schwabnetwork.com/markets/${market}`;
    const response = await got(url);
    const $ = load(response.body);

    const nextDataRaw = $('#__NEXT_DATA__').html();
    const nextData = JSON.parse(nextDataRaw || '{}');

    const articles = Object.values(nextData.props.pageProps.context.META_CATEGORY_ARTICLES.value).flat();

    const items = articles.map(async (article: any) => {
        const articleResponse = await got(`https://www.schwabnetwork.com${article.href}`);
        const article$ = load(articleResponse.body);
        const nextDataRaw = article$('#__NEXT_DATA__').html();
        const nextData = JSON.parse(nextDataRaw || '{}');
        const articleContent = nextData.props.pageProps.context.articleContent.value.content.blocks[0].content ?? '';

        return {
            title: article.name,
            link: `https://www.schwabnetwork.com${article.href}`,
            description: articleContent,
            guid: article.id,
            pubDate: new Date(article.date).toUTCString(),
        };
    });

    const resolvedItems = await Promise.all(items);
    const uniqueItems = new Map(resolvedItems.map((item) => [item.guid, item])).values().toArray();

    const result = {
        title: `Schwab Network - Markets (${market || 'Overview'})`,
        description: `Latest news and updates from Schwab Network's ${market || 'Overview'} section.`,
        link: url,
        item: uniqueItems,
    };
    return result;
}
