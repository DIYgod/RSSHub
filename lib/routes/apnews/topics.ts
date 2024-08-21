import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { fetchArticle, removeDuplicateByKey } from './utils';
const HOME_PAGE = 'https://apnews.com';

export const route: Route = {
    path: '/topics/:topic?',
    categories: ['traditional-media', 'popular'],
    example: '/apnews/topics/apf-topnews',
    view: ViewType.Articles,
    parameters: {
        topic: {
            description: 'Topic name, can be found in URL. For example: the topic name of AP Top News [https://apnews.com/apf-topnews](https://apnews.com/apf-topnews) is `apf-topnews`',
            default: 'trending-news',
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
            source: ['apnews.com/hub/:topic'],
            target: '/topics/:topic',
        },
    ],
    name: 'Topics',
    maintainers: ['zoenglinghou', 'mjysci', 'TonyRL'],
    handler,
};

async function handler(ctx) {
    const { topic = 'trending-news' } = ctx.req.param();
    const url = `${HOME_PAGE}/hub/${topic}`;
    const response = await got(url);
    const $ = load(response.data);

    const items = await Promise.all(
        $(':is(.PagePromo-content, .PageListStandardE-leadPromo-info) bsp-custom-headline')
            .get()
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : Infinity)
            .map((e) => ({
                title: $(e).find('span.PagePromoContentIcons-text').text(),
                link: $(e).find('a').attr('href'),
            }))
            .filter((e) => typeof e.link === 'string')
            .map((item) => fetchArticle(item))
    );

    return {
        title: $('title').text(),
        description: $("meta[property='og:description']").text(),
        link: url,
        item: removeDuplicateByKey(items, 'guid'),
        language: $('html').attr('lang'),
    };
}
