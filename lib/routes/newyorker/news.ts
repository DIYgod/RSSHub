import { Route } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
const host = 'https://www.newyorker.com';
export const route: Route = {
    path: '/:category/:subCategory?',
    categories: ['traditional-media'],
    example: '/newyorker/everything',
    parameters: { category: 'rss category. can be found at `https://www.newyorker.com/about/feeds`' },
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
            source: ['newyorker.com/feed/:category/:subCategory?'],
        },
    ],
    name: 'The New Yorker',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler(ctx) {
    const { category, subCategory } = ctx.req.param();
    const rssUrl = subCategory ? `${host}/feed/${category}/${subCategory}` : `${host}/feed/${category}`;
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.link);
                const $ = load(data);
                const description = $('#main-content');
                description.find('h1').remove();
                description.find('.article-body__footer').remove();
                description.find('.social-icons').remove();
                description.find('div[class^="ActionBarWrapperContent-"]').remove();
                description.find('div[class^="ContentHeaderByline-"]').remove();
                return {
                    title: item.title,
                    pubDate: item.pubDate,
                    link: item.link,
                    category: item.categories,
                    description: description.html(),
                };
            })
        )
    );

    return {
        title: `The New Yorker - ${feed.title}`,
        link: host,
        description: 'Reporting, Profiles, breaking news, cultural coverage, podcasts, videos, and cartoons from The New Yorker.',
        item: items,
    };
}
