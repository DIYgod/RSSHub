import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import rssParser from '@/utils/rss-parser';

import { getArticleDetails } from './utils';

export const route: Route = {
    path: '/author/:slug',
    categories: ['traditional-media'],
    example: '/theatlantic/author/ian-bogost',
    parameters: { slug: 'Author slug, which can be found in the author page URL' },
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
            source: ['www.theatlantic.com/author/:slug'],
            target: '/author/:slug',
        },
    ],
    name: 'Author',
    maintainers: ['DzmingLi'],
    handler,
    description: 'Articles written by a specific author.',
};

async function handler(ctx) {
    const host = 'https://www.theatlantic.com';
    const slug = ctx.req.param('slug');
    const link = `${host}/author/${slug}/`;
    const feed = await rssParser.parseString(await ofetch(`${host}/feed/author/${slug}/`));
    const author = feed.title?.replace(' | The Atlantic', '') ?? slug;
    const list = feed.items
        .filter((item) => item.link)
        .map((item) => {
            const articleUrl = new URL(item.link!);
            articleUrl.search = '';

            return {
                link: articleUrl.href,
                pubDate: item.pubDate,
            };
        });
    const items = await getArticleDetails(list);

    return {
        title: feed.title ?? `The Atlantic - ${author}`,
        link,
        description: `The Atlantic articles by ${author}`,
        item: items,
    };
}
