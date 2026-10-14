import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

const newsTimezone = 'America/New_York';

function getNewsDate(value: string, referenceDate: Date | undefined) {
    if (!referenceDate || !Number.isFinite(referenceDate.getTime())) {
        return;
    }
    const current = dayjs(referenceDate).tz(newsTimezone).locale('en');
    let date;
    if (/^\d{1,2}:\d{2}[AP]M$/.test(value)) {
        date = dayjs.tz(`${current.format('YYYY-MM-DD')} ${value}`, 'YYYY-MM-DD hh:mmA', newsTimezone);
    } else if (/^[a-z]{3}-\d{2}$/i.test(value)) {
        date = dayjs.tz(`${value}-${current.year()}`, 'MMM-DD-YYYY', newsTimezone);
        if (date.isAfter(current, 'day')) {
            date = dayjs.tz(`${value}-${current.year() - 1}`, 'MMM-DD-YYYY', newsTimezone);
        }
    }
    return date?.isValid() ? parseDate(date.format()) : undefined;
}

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
| ---- | ----- |
| news | blogs |`,
};

async function handler(ctx) {
    const { category = 'News' } = ctx.req.param();
    const limit = getRouteLimit(ctx, 200);

    if (!Object.hasOwn(categories, category.toLowerCase())) {
        throw new InvalidParameterError(`No category '${category}'.`);
    }

    const rootUrl = 'https://finviz.com';
    const currentUrl = new URL('news.ashx', rootUrl).href;

    const response = await ofetch.raw(currentUrl, { responseType: 'text' });
    const responseDate = response.headers.get('date');
    const referenceDate = responseDate ? parseDate(responseDate) : undefined;
    const $ = load(response._data!);

    const items = $('table.table-fixed')
        .eq(categories[category.toLowerCase()])
        .find('tr')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const a = $item.find('a.nn-tab-link');

            const descriptionMatches = a
                .parent()
                .prop('data-boxover')
                ?.match(/<td class='news_tooltip-tab'>(.*?)<\/td>/);
            const authorMatches = $item
                .find('use')
                .first()
                .prop('href')
                ?.match(/#(.*?)-(light|dark)/);

            return {
                title: a.text(),
                link: a.prop('href'),
                description: descriptionMatches ? descriptionMatches[1] : undefined,
                author: authorMatches ? authorMatches[1].replaceAll('-', ' ') : 'finviz',
                pubDate: getNewsDate($item.find('td.news_date-cell').text().trim(), referenceDate),
            };
        })
        .filter((item) => item.title);

    const sorted = ctx.req.query('sorted') !== 'false';
    const candidates = sorted && items.some((item) => !item.pubDate || !Number.isFinite(item.pubDate.getTime())) ? items : (sorted ? items.toSorted((a, b) => b.pubDate!.getTime() - a.pubDate!.getTime()) : items).slice(0, limit);
    const icon = $('link[rel="icon"]').prop('href');

    return {
        item: candidates,
        title: `finviz - ${category}`,
        link: currentUrl,
        description: $('meta[name="description"]').prop('content'),
        language: 'en-us' as const satisfies Language,
        image: new URL($('a.logo svg use').first().prop('href')!, rootUrl).href,
        icon,
        logo: icon,
        subtitle: $('title').text(),
    };
}
