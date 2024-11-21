import { Route } from '@/types';
import { processItems } from './utils';
import got from '@/utils/got';
import cache from '@/utils/cache';
import { config } from '@/config';

export const route: Route = {
    path: '/news/:lang?/:id?',
    categories: ['traditional-media'],
    example: '/dw/news',
    parameters: {
        lang: 'Language, see below, default to en',
        id: 'Category ID, see below, default to the id of the Top Stories Page of the language chosen',
    },
    features: {
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
        requireConfig: false,
    },
    name: 'News',
    maintainers: ['quiniapiezoelectricity'],
    handler,
    description: `
:::tip
Parameters can be obtained from the official website, for instance:
For the site https://www.dw.com/de/deutschland/s-12321 the language code would be \`de\` and the category ID would be \`s-1432\`.
:::
`,
    radar: [
        {
            source: ['www.dw.com/:lang/:name/:id'],
            target: '/news/:lang/:id',
        },
    ],
};

const defaultUrl = `https://www.dw.com/graph-api/en/content/navigation/9097`;
const typenames = new Set(['Article', 'Liveblog', 'Video']);

async function handler(ctx) {
    const lang = ctx.req.param('lang') ?? 'en';
    let id = ctx.req.param('id');

    if (/^s-\d+$/.test(id)) {
        id = id.match(/^s-(\d+)$/i)[1]; // convert s-1234 id to 1234
    } else if (id === undefined) {
        // Look up the id of the Top Stories Page of the selected language if id is not specified in the URL.
        const navigation = await cache.tryGet(
            'dw:navigation',
            async () => {
                const res = await got(defaultUrl);
                return res.data.data.content.topStoriesNavigations;
            },
            config.cache.routeExpire,
            false
        );
        id = navigation
            .map((item) => item.namedUrl.split('/'))
            .find((item) => item[1] === lang)[3]
            .match(/^s-(\d+)$/i)[1];
    }

    const response = await got(`https://www.dw.com/graph-api/${lang}/content/navigation/${id}`);
    const feed = response.data.data.content;
    cache.set('dw:navigation', feed.topStoriesNavigations, config.cache.routeExpire);

    const list = feed.contentComposition.informationSpaces.flatMap((section) => Object.values(section).flatMap((component) => component[0]?.contents || [])).filter((item) => typenames.has(item.__typename) && item.id);
    const items = await processItems(
        list.map((item) => {
            item.link = new URL(item.namedUrl, 'https://www.dw.com').href;
            item.pubDate = item.contentDate;
            item.description = item.teaser;
            item.language = lang;
            item.type = item.__typename.toLowerCase();
            return item;
        })
    );

    return {
        title: `DW | ${feed.title}`,
        link: feed.canonicalUrl,
        description: feed.metaDescription,
        language: feed.topStoriesNavigations.find((item) => item.namedUrl.startsWith(`/${lang}/`))?.localeLang ?? lang,
        item: items,
    };
}
