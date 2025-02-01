import { Data, Route } from '@/types';
import { getItems } from './utils';
import type { Context } from 'hono';

export const route: Route = {
    path: '/category/:category',
    categories: ['finance'],
    url: 'insider.finology.in/business',
    example: '/finology/success-stories',
    parameters: { category: 'Refer Table below or find in URL' },
    radar: [
        {
            source: ['insider.finology.in/:category'],
        },
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
        selector: `div.card`,
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
