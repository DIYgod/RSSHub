import { Route } from '@/types';
import { ProcessFeed } from './utils';

async function handler(ctx) {
    const { author = '', category } = ctx.req.param();
    const url = category ? `https://home.gamer.com.tw/creationCategory.php?owner=${author}&c=${category}` : `https://home.gamer.com.tw/creation.php?owner=${author}`;

    const { title, items } = await ProcessFeed(url);

    return {
        title,
        link: url,
        item: items,
    };
}

export const route: Route = {
    path: '/creation/:author/:category?',
    categories: ['anime'],
    example: '/bahamut/creation/a1102kevin',
    parameters: {
        author: '作者',
        category: '分类',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '巴哈姆特的創作大廳',
    maintainers: ['hoilc', 'bGZo'],
    handler,
};
