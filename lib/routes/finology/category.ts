import type { Context } from 'hono';

import type { Data, Route } from '@/types';

import { getItems } from './utils';

export const route: Route = {
    path: '/category/:category',
    categories: ['finance'],
    url: 'insider.finology.in/business',
    example: '/finology/category/success-stories',
    parameters: { category: 'Refer Table below or find in URL' },
    radar: [
        { source: ['insider.finology.in/business'], target: '/category/business' },
        { source: ['insider.finology.in/entrepreneurship'], target: '/category/entrepreneurship' },
        { source: ['insider.finology.in/startups-india'], target: '/category/startups-india' },
        { source: ['insider.finology.in/success-stories'], target: '/category/success-stories' },
        { source: ['insider.finology.in/juicy-scams'], target: '/category/juicy-scams' },
        { source: ['insider.finology.in/finance'], target: '/category/finance' },
        { source: ['insider.finology.in/economy'], target: '/category/economy' },
        { source: ['insider.finology.in/market-news'], target: '/category/market-news' },
        { source: ['insider.finology.in/tax'], target: '/category/tax' },
        { source: ['insider.finology.in/your-money'], target: '/category/your-money' },
        { source: ['insider.finology.in/investing'], target: '/category/investing' },
        { source: ['insider.finology.in/stock-market'], target: '/category/stock-market' },
        { source: ['insider.finology.in/stock-ratios'], target: '/category/stock-ratios' },
        { source: ['insider.finology.in/behavioral-finance'], target: '/category/behavioral-finance' },
        { source: ['insider.finology.in/mutual-fund'], target: '/category/mutual-fund' },
    ],
    name: 'Category',
    maintainers: ['Rjnishant530'],
    handler,
    description: `::: info Category

| Category              | Link               |
| --------------------- | ------------------ |
| **Business**          | business           |
| Big Shots             | entrepreneurship   |
| Startups              | startups-india     |
| Brand Games           | success-stories    |
| Juicy Scams           | juicy-scams        |
| **Finance**           | finance            |
| Macro Moves           | economy            |
| News Platter          | market-news        |
| Tax Club              | tax                |
| Your Money            | your-money         |
| **Invest**            | investing          |
| Stock Market          | stock-market       |
| Financial Ratios      | stock-ratios       |
| Investor's Psychology | behavioral-finance |
| Mutual Funds          | mutual-fund        |

:::`,
};

async function handler(ctx: Context) {
    const { category } = ctx.req.param();
    const extra = {
        description: (topic: string) => `Articles for your research and knowledge under ${topic}`,
        date: true,
        selector: 'div.card',
    };
    return await commonHandler('https://insider.finology.in', `/${category}`, extra);
}

export async function commonHandler(baseUrl: string, route: string, extra: any): Promise<Data> {
    const { items, topicName } = await getItems(`${baseUrl}${route}`, extra);
    return {
        title: `${topicName} - Finology Insider`,
        link: `${baseUrl}${route}`,
        item: items,
        description: extra.description(topicName || ''),
        logo: 'https://insider.finology.in/Images/favicon/favicon.ico',
        icon: 'https://insider.finology.in/Images/favicon/favicon.ico',
        language: 'en-us',
    };
}
