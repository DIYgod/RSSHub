import { Route } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import { load } from 'cheerio';
import ofetch from '@/utils/ofetch';
const host = 'https://www.gq.com';
export const route: Route = {
    path: '/news',
    categories: ['traditional-media'],
    example: '/gq/news',
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
            source: ['gq.com/'],
        },
    ],
    name: 'News',
    maintainers: ['EthanWng97'],
    handler,
};

async function handler() {
    const rssUrl = `${host}/feed/rss`;
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                const data = await ofetch(item.link);
                const $ = load(data);
                const description = $('#main-content');
                description.find('.article-body__footer').remove();
                description.find('[class*="ContentHeaderContributorImage"]').remove();
                description.find('h1').remove();
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
        title: 'GQ',
        link: host,
        description: `GQ is the global flagship of men's fashion, the arbiter of cool for anyone who sees the world through the lens of taste and style.`,
        item: items,
    };
}
