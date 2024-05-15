import { Route } from '@/types';
import logger from '@/utils/logger';
import { getItems } from './utils';

export const route: Route = {
    path: ['/:category', '/tag/:topic'],
    categories: ['finance'],
    example: '/finology/success-stories',
    parameters: { category: 'N' },
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
            source: ['insider.finology.in/:category'],
        },
    ],
    name: 'Category',
    maintainers: ['Rjnishant530'],
    handler,
    description: `:::note Category
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

async function handler(ctx) {
    const { topic, category } = ctx.req.param();
    const baseUrl = 'https://insider.finology.in';
    let route;
    let number;
    if (topic) {
        route = `/tag/${topic}`;
        number = 2;
    } else if (category) {
        route = `/${category}`;
        number = 6;
    } else {
        logger.error('Invalid URL');
    }
    const extra = {
        date: true,
        topicName: '',
        selector: `div.w100.pb${number}.bg-color.flex.flex-col.align-center div.w23.br0625.shadow.position-r.bg-white.m-w100.card.t-w45`,
    };
    const listItems = await getItems(ctx, `${baseUrl}${route}`, extra);
    return {
        title: `${extra.topicName} - Finology Insider`,
        link: `${baseUrl}${route}`,
        item: listItems,
        description: number === 2 ? `Everything that Insider has to offer about ${extra.topicName} for you to read and learn.` : `Articles for your research and knowledge under ${extra.topicName}`,
        logo: 'https://assets.finology.in/insider/images/favicon/apple-touch-icon.png',
        icon: 'https://assets.finology.in/insider/images/favicon/favicon-32x32.png',
        language: 'en-us',
    };
}
