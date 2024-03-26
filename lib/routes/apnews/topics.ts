import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
const HOME_PAGE = 'https://apnews.com';

export const route: Route = {
    path: '/topics/:topic?',
    categories: ['traditional-media'],
    example: '/apnews/topics/apf-topnews',
    parameters: { topic: 'Topic name, can be found in URL. For example: the topic name of AP Top News [https://apnews.com/apf-topnews](https://apnews.com/apf-topnews) is `apf-topnews`, `trending-news` by default' },
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
        $('.PagePromo-content bsp-custom-headline')
            .get()
            .slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit')) : Infinity)
            .map((e) => ({
                title: $(e).find('span.PagePromoContentIcons-text').text(),
                link: $(e).find('a').attr('href'),
            }))
            .filter((e) => typeof e.link === 'string')
            .map((item) =>
                cache.tryGet(item.link, async () => {
                    const { data: response } = await got(item.link);
                    const $ = load(response);
                    $('div.Enhancement').remove();
                    return Object.assign(item, {
                        pubDate: timezone(new Date($("meta[property='article:published_time']").attr('content')), 0),
                        updated: timezone(new Date($("meta[property='article:modified_time']").attr('content')), 0),
                        description: $('div.RichTextStoryBody').html(),
                        category: $("meta[property='article:section']").attr('content'),
                        guid: $("meta[name='brightspot.contentId']").attr('content'),
                    });
                })
            )
    );

    return {
        title: $('title').text(),
        description: $("meta[property='og:description']").text(),
        link: url,
        item: items,
        language: $('html').attr('lang'),
    };
}
