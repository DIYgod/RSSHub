import { Route, ViewType } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const categories = {
    news: 0,
    blogs: 1,
};

export const route: Route = {
    path: '/:category?',
    categories: ['finance'],
    view: ViewType.Articles,
    example: '/finviz',
    parameters: {
        category: {
            description: 'Category, see below, News by default',
            options: Object.keys(categories).map((key) => ({ value: key, label: key })),
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
            source: ['finviz.com/news.ashx', 'finviz.com/'],
        },
    ],
    name: 'News',
    maintainers: ['nczitzk'],
    handler,
    url: 'finviz.com/news.ashx',
    description: `| News | Blogs |
| ---- | ---- |
| news | blogs |`,
};

async function handler(ctx) {
    const { category = 'News' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 200;

    if (!Object.hasOwn(categories, category.toLowerCase())) {
        throw new InvalidParameterError(`No category '${category}'.`);
    }

    const rootUrl = 'https://finviz.com';
    const currentUrl = new URL('news.ashx', rootUrl).href;

    const { data: response } = await got(currentUrl);

    const $ = load(response);

    const items = $('table.table-fixed')
        .eq(categories[category.toLowerCase()])
        .find('tr')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);

            const a = item.find('a.nn-tab-link');

            const descriptionMatches = a
                .parent()
                .prop('data-boxover')
                ?.match(/<td class='news_tooltip-tab'>(.*?)<\/td>/);
            const authorMatches = item
                .find('use')
                .first()
                .prop('href')
                ?.match(/#(.*?)-(light|dark)/);

            return {
                title: a.text(),
                link: a.prop('href'),
                description: descriptionMatches ? descriptionMatches[1] : undefined,
                author: authorMatches ? authorMatches[1].replaceAll('-', ' ') : 'finviz',
                pubDate: timezone(parseDate(item.find('td.news_date-cell').text(), ['HH:mmA', 'MMM-DD']), -4),
            };
        })
        .filter((item) => item.title);

    const icon = $('link[rel="icon"]').prop('href');

    return {
        item: items,
        title: `finviz - ${category}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'en-US',
        image: new URL($('a.logo svg use').first().prop('href'), rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('title').text(),
    };
}
