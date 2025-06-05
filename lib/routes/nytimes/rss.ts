import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';

export const route: Route = {
    path: '/rss/:cat?',
    categories: ['traditional-media'],
    view: ViewType.Articles,
    example: '/nytimes/rss/HomePage',
    parameters: {
        cat: {
            description: "Category name, corresponding to the last segment of [official feed's](https://www.nytimes.com/rss) url.",
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
            source: ['nytimes.com/'],
            target: '',
        },
    ],
    name: 'News',
    maintainers: ['HenryQW', 'pseudoyu', 'dzx-dzx'],
    handler,
    url: 'nytimes.com/',
    description: `Enhance the official EN RSS feed`,
};

async function handler(ctx) {
    const url = `https://rss.nytimes.com/services/xml/rss/nyt/${ctx.req.param('cat')}.xml`;

    const rss = await parser.parseURL(url);

    return {
        ...rss,
        item: await Promise.all(
            rss.items.map((e) =>
                cache.tryGet(e.link, async () => {
                    const res = await ofetch(e.link, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }, referrer: 'https://www.google.com/' });

                    const $ = load(res);

                    return {
                        ...e,
                        description: $("[name='articleBody']").html(),
                        author: $('meta[name="byl"]').attr('content'),
                    };
                })
            )
        ),
    };
}
