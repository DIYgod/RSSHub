import { load } from 'cheerio';

import type { Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const ROOT_URL = 'https://www.lemonde.fr/en';

const feedMap: Record<string, string> = {
    '': `${ROOT_URL}/rss/une.xml`,
    // World
    international: `${ROOT_URL}/international/rss_full.xml`,
    americas: `${ROOT_URL}/americas/rss_full.xml`,
    'united-kingdom': `${ROOT_URL}/united-kingdom/rss_full.xml`,
    'united-states': `${ROOT_URL}/united-states/rss_full.xml`,
    africa: `${ROOT_URL}/le-monde-africa/rss_full.xml`,
    'asia-pacific': `${ROOT_URL}/asia-and-pacific/rss_full.xml`,
    'middle-east': `${ROOT_URL}/middle-east/rss_full.xml`,
    // Europe
    europe: `${ROOT_URL}/europe/rss_full.xml`,
    // France
    politics: `${ROOT_URL}/politics/rss_full.xml`,
    'police-and-justice': `${ROOT_URL}/police-and-justice/rss_full.xml`,
    education: `${ROOT_URL}/education/rss_full.xml`,
    'french-delights': `${ROOT_URL}/french-delights/rss_full.xml`,
    // Environment
    environment: `${ROOT_URL}/environment/rss_full.xml`,
    // Economy
    economy: `${ROOT_URL}/economy/rss_full.xml`,
    'world-economy': `${ROOT_URL}/world-economy/rss_full.xml`,
    'french-economy': `${ROOT_URL}/french-economy/rss_full.xml`,
    // M Magazine
    'm-le-mag': `${ROOT_URL}/m-le-mag/rss_full.xml`,
    lifestyle: `${ROOT_URL}/lifestyle/rss_full.xml`,
    fashion: `${ROOT_URL}/fashion/rss_full.xml`,
    food: `${ROOT_URL}/food/rss_full.xml`,
    travel: `${ROOT_URL}/travel/rss_full.xml`,
    // Culture
    culture: `${ROOT_URL}/culture/rss_full.xml`,
    arts: `${ROOT_URL}/arts/rss_full.xml`,
    cinema: `${ROOT_URL}/cinema/rss_full.xml`,
    music: `${ROOT_URL}/music/rss_full.xml`,
    books: `${ROOT_URL}/books/rss_full.xml`,
    // Global Issues
    'global-issues': `${ROOT_URL}/global-issues/rss_full.xml`,
    // Pixels
    pixels: `${ROOT_URL}/pixels/rss_full.xml`,
    'artificial-intelligence': `${ROOT_URL}/artificial-intelligence/rss_full.xml`,
    'social-media': `${ROOT_URL}/social-media/rss_full.xml`,
    // Sports
    sports: `${ROOT_URL}/sports/rss_full.xml`,
    football: `${ROOT_URL}/football/rss_full.xml`,
    rugby: `${ROOT_URL}/rugby/rss_full.xml`,
    tennis: `${ROOT_URL}/tennis/rss_full.xml`,
    cycling: `${ROOT_URL}/cycling/rss_full.xml`,
    basketball: `${ROOT_URL}/basketball/rss_full.xml`,
    // Science & Health
    science: `${ROOT_URL}/science/rss_full.xml`,
    health: `${ROOT_URL}/health/rss_full.xml`,
    intimacy: `${ROOT_URL}/intimacy/rss_full.xml`,
    // Others
    'les-decodeurs': `${ROOT_URL}/les-decodeurs/rss_full.xml`,
    'our-times': `${ROOT_URL}/our-times/rss_full.xml`,
    obituaries: `${ROOT_URL}/obituaries/rss_full.xml`,
    religion: `${ROOT_URL}/religion/rss_full.xml`,
    // Opinion
    opinion: `${ROOT_URL}/opinion/rss_full.xml`,
    editorials: `${ROOT_URL}/editorials/rss_full.xml`,
    columns: `${ROOT_URL}/columns/rss_full.xml`,
    'op-eds': `${ROOT_URL}/op-eds/rss_full.xml`,
};

export const route: Route = {
    path: '/en/:category?',
    categories: ['traditional-media'],
    example: '/lemonde/en',
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
            source: ['lemonde.fr/en/:category'],
            target: '/en/:category',
        },
    ],
    name: 'News (English)',
    maintainers: ['mlkgrnt'],
    handler,
    description: `| Category                | Description               |
| ----------------------- | ------------------------- |
| (empty)                 | Homepage / Top stories    |
| international           | World – International     |
| americas                | World – Americas          |
| united-kingdom          | World – United Kingdom    |
| united-states           | World – United States     |
| africa                  | World – Africa            |
| asia-pacific            | World – Asia Pacific      |
| middle-east             | World – Middle East       |
| europe                  | Europe                    |
| politics                | France – French Politics  |
| police-and-justice      | France – French Justice   |
| education               | France – French Education |
| french-delights         | France – French Delights  |
| environment             | Environment               |
| economy                 | Economy                   |
| world-economy           | Economy – World Economy   |
| french-economy          | Economy – French Economy  |
| m-le-mag                | M Magazine                |
| lifestyle               | M Magazine – Lifestyle    |
| fashion                 | M Magazine – Fashion      |
| food                    | M Magazine – Food         |
| travel                  | M Magazine – Travel       |
| culture                 | Culture                   |
| arts                    | Culture – Art             |
| cinema                  | Culture – Cinema          |
| music                   | Culture – Music           |
| books                   | Culture – Books           |
| global-issues           | Global Issues             |
| pixels                  | Pixels                    |
| artificial-intelligence | Pixels – AI               |
| social-media            | Pixels – Social Media     |
| sports                  | Sports                    |
| football                | Sports – Football         |
| rugby                   | Sports – Rugby            |
| tennis                  | Sports – Tennis           |
| cycling                 | Sports – Cycling          |
| basketball              | Sports – Basketball       |
| science                 | Science                   |
| health                  | Health                    |
| intimacy                | Intimacy                  |
| les-decodeurs           | Les Décodeurs             |
| our-times               | Our Times                 |
| obituaries              | Obituaries                |
| religion                | Religion                  |
| opinion                 | Opinion                   |
| editorials              | Opinion – Editorials      |
| columns                 | Opinion – Columns         |
| op-eds                  | Opinion – Op-Eds          |`,
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

    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 20;

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
        title: feedTitle || 'Le Monde in English',
        link: feedLink,
        description: feedTitle || 'Le Monde in English',
        language: 'en',
        item: items,
    };
}
