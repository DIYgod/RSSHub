import { Route, ViewType } from '@/types';
import cache from '@/utils/cache';
import parser from '@/utils/rss-parser';
import ofetch from '@/utils/ofetch';
import { load } from 'cheerio';
const host = 'https://www.magnumphotos.com';
export const route: Route = {
    path: '/magazine',
    categories: ['picture', 'popular'],
    view: ViewType.Pictures,
    example: '/magnumphotos/magazine',
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
            source: ['magnumphotos.com/'],
        },
    ],
    name: 'Magazine',
    maintainers: ['EthanWng97'],
    handler,
    url: 'magnumphotos.com/',
};

async function handler() {
    const rssUrl = `${host}/feed/`;
    const feed = await parser.parseURL(rssUrl);
    const items = await Promise.all(
        feed.items.map((item) =>
            cache.tryGet(item.link, async () => {
                if (!item.link) {
                    return;
                }
                const data = await ofetch(item.link);
                const $ = load(data);
                const description = $('#content');
                description.find('ul.share').remove();
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
        title: 'Magnum Photos',
        link: host,
        description: 'Magnum is a community of thought, a shared human quality, a curiosity about what is going on in the world, a respect for what is going on and a desire to transcribe it visually',
        item: items,
    };
}
