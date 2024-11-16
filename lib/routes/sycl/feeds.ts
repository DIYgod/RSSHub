import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/:feed?',
    categories: ['programming'],
    example: '/sycl/news',
    parameters: { feed: 'Feed source, defaults to news, references https://feeds.sycl.tech/' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Feeds',
    maintainers: ['mocusez'],
    handler,
    description: `|  Events  | News |    Research Paper     |  Videos  |
| :----: | :--: | :-------------: | :----: |
| events | news | research_papers | videos |`,
};

async function handler(ctx) {
    const feeds: string[] = ['news', 'events', 'research_papers', 'videos'];
    let { feed = 'news' } = ctx.req.param();
    if (!feeds.includes(feed)) {
        feed = 'news';
    }
    const data = await ofetch(`https://feeds.sycl.tech/${feed}/feed.json`);

    const items = data.items.map((item) => ({
        title: item.title,
        link: item.external_url,
        description: item.content_html,
        pubDate: parseDate(item.date_published),
        author: item.author.name,
    }));

    return {
        title: `SYCL.tech ${feed}`,
        link: `https://feeds.sycl.tech/${feed}/feed.json`,
        item: items,
    };
}
