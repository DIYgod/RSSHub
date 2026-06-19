import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
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
    example: '/lemonde',
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

    const xml = await ofetch(feedUrl);
    const $ = load(xml, { xml: true });

    const channel = $('channel');
    const feedTitle = channel.children('title').text();
    const feedLink = channel.children('link').text() || ROOT_URL;

    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 20;

    const items = $('item')
        .toArray()
        .slice(0, limit)
        .map((el) => {
            const item = $(el);
            const link = item.children('link').text() || item.children('guid').text();
            const title = item.children('title').text();
            const pubDateText = item.children('pubDate').text();
            const summary = item.children('description').text();
            const categoryList = item
                .children('category')
                .toArray()
                .map((c) => $(c).text())
                .filter(Boolean);
            const imageUrl = item.find(String.raw`media\:content`).attr('url');
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
                category: categoryList,
                guid: link,
            };
        })
        .filter((item) => item.link);

    return {
        title: feedTitle || 'Le Monde',
        link: feedLink,
        description: feedTitle || 'Le Monde',
        language: 'fr',
        item: items,
    };
}
