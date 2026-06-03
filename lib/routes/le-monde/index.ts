import type { Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://www.lemonde.fr';

const feedMap: Record<string, string> = {
    '': `${ROOT_URL}/rss/une.xml`,
    international: `${ROOT_URL}/international/rss_full.xml`,
    politique: `${ROOT_URL}/politique/rss_full.xml`,
    economie: `${ROOT_URL}/economie/rss_full.xml`,
    societe: `${ROOT_URL}/societe/rss_full.xml`,
    culture: `${ROOT_URL}/culture/rss_full.xml`,
    sport: `${ROOT_URL}/sport/rss_full.xml`,
    planete: `${ROOT_URL}/planete/rss_full.xml`,
    pixels: `${ROOT_URL}/pixels/rss_full.xml`,
    sciences: `${ROOT_URL}/sciences/rss_full.xml`,
    idees: `${ROOT_URL}/idees/rss_full.xml`,
    sante: `${ROOT_URL}/sante/rss_full.xml`,
    em: `${ROOT_URL}/em/rss_full.xml`,
    'en-continu': `${ROOT_URL}/en-continu/rss_full.xml`,
    decodeurs: `${ROOT_URL}/decodeurs/rss_full.xml`,
};

export const route: Route = {
    path: '/:category?',
    categories: ['traditional-media'],
    example: '/le-monde',
    view: ViewType.Articles,
    parameters: {
        category: {
            description: 'Category slug, see table below. Defaults to homepage.',
            default: '',
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
            source: ['lemonde.fr/:category'],
            target: '/:category',
        },
    ],
    name: 'News',
    maintainers: ['mlkgrnt'],
    handler,
    description: `| Category      | Description            |
| ------------- | ---------------------- |
| (empty)       | Homepage / Top stories |
| international | International          |
| politique     | Politics               |
| economie      | Economy                |
| societe       | Society                |
| culture       | Culture                |
| sport         | Sports                 |
| planete       | Environment            |
| pixels        | Tech / Digital         |
| sciences      | Sciences               |
| idees         | Opinions               |
| sante         | Health                 |
| em            | M le mag               |
| en-continu    | Live / Breaking        |
| decodeurs     | Fact-checking          |`,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '';
    const feedUrl = feedMap[category];

    if (!feedUrl) {
        throw new Error(`Invalid category: ${category}`);
    }

    const xml = await ofetch(feedUrl, { responseType: 'text' });
    const { load } = await import('cheerio');
    const $ = load(xml, { xml: true });

    const channel = $('channel').first();
    const feedTitle = channel.children('title').first().text();
    const feedLink = channel.children('link').first().text() || ROOT_URL;

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

    const items = $('item')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const item = $(el);
            const link = item.children('link').first().text() || item.children('guid').first().text();
            const title = item.children('title').first().text();
            const pubDateText = item.children('pubDate').first().text();
            const summary = item.children('description').first().text();
            const imageUrl = item.find(String.raw`media\:content`).attr('url') || item.find('content').attr('url');
            const imageCredit = item.find(String.raw`media\:credit`).text();

            let description = '';
            if (imageUrl) {
                description += `<img src="${imageUrl}" />`;
            }
            if (imageCredit) {
                description += `<p><em>${imageCredit}</em></p>`;
            }
            if (summary) {
                description += summary;
            }

            return {
                title,
                link,
                pubDate: pubDateText ? parseDate(pubDateText) : undefined,
                description,
                guid: link,
            };
        })
        .filter((item) => item.link);

    return {
        title: feedTitle || 'Le Monde',
        link: feedLink,
        description: feedTitle || 'Le Monde',
        language: 'fr',
        item: items.map((item) =>
            cache.tryGet(item.link, () => ({
                title: item.title,
                link: item.link,
                pubDate: item.pubDate,
                description: item.description,
                guid: item.guid,
            }))
        ),
    };
}
