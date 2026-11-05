import { load } from 'cheerio';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function getPublicationDate(value?: string): Date | undefined {
    if (!value?.trim()) {
        return undefined;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
function getCalendarDate(value: string): Date | undefined {
    if (!value.trim()) {
        return undefined;
    }
    const date = parseDate(value.trim(), 'D MMMM YYYY', 'en', true);
    // A calendar-only source date uses UTC midnight without implying a publication instant.
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
type ArticleDetails = Pick<DataItem, 'description' | 'category'> & {
    listTitle?: string;
    listDate?: number;
    calendarDate: string;
};
async function getArticleDetails(
    item: Partial<DataItem> & {
        link: string;
    }
): Promise<ArticleDetails> {
    const detailResponse = await got({ method: 'get', url: item.link });
    const content = load(detailResponse.data);
    const tags = content('.sf-item-header-wrapper .sf-tags-list-item')
        .toArray()
        .map((element) => content(element).text().trim())
        .filter(Boolean);
    const body = content('.sf-detail-body-wrapper');
    if (!body.length) {
        throw new Error(`WHO speech content not found: ${item.link}`);
    }
    return {
        description: body.html(),
        category: tags.length ? tags : undefined,
        calendarDate: content('.sf-item-header-wrapper .timestamp').text(),
        listTitle: item.title,
        listDate: isNullish(item.pubDate) ? undefined : parseDate(item.pubDate).getTime(),
    };
}
export const route: Route = {
    path: '/speeches/:language?',
    categories: ['government'],
    example: '/who/speeches',
    parameters: { language: 'Language, see below, English by default' },
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
            source: ['who.int/director-general/speeches', 'who.int/news-room/speeches'],
            target: '/speeches',
        },
    ],
    name: 'Speeches',
    maintainers: ['nczitzk'],
    handler,
    url: 'who.int/news-room/speeches',
    description: `Language

| English | العربية | 中文 | Français | Русский | Español | Português |
| ------- | ------- | ---- | -------- | ------- | ------- | --------- |
| en      | ar      | zh   | fr       | ru      | es      | pt        |`,
};
async function handler(ctx) {
    const language = ctx.req.param('language') || 'en';
    const rootUrl = 'https://www.who.int';
    const currentUrl = `${rootUrl}/${language === 'en' ? 'news-room/speeches' : `${language}/director-general/speeches`}`;
    const apiUrl = `${rootUrl}/api/hubs/speeches?sf_culture=${language}&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });
    const list: Array<
        DataItem & {
            link: string;
        }
    > = response.data.value.map((item) => ({
        title: item.Title,
        link: `${currentUrl}/${language === 'en' ? 'item' : 'detail'}/${item.ItemDefaultUrl.replace(/^\/+/, '')}`,
        pubDate: getPublicationDate(item.PublicationDateAndTime),
    }));
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`who:speech-details:${item.link}`, async () => await getArticleDetails(item));
                const listDate = isNullish(item.pubDate) ? undefined : parseDate(item.pubDate).getTime();
                return {
                    ...item,
                    description: detail.description,
                    category: detail.category,
                    pubDate: detail.listDate === listDate ? (item.pubDate ?? getCalendarDate(detail.calendarDate)) : item.pubDate,
                };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: 'Speeches - WHO',
        link: currentUrl,
        item: items,
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
function isNullish(value: unknown): value is null | undefined {
    return isOneOf(value, [null, undefined]);
}

function isOneOf<const T>(value: unknown, values: readonly T[]): value is T {
    const candidates: readonly unknown[] = values;
    return candidates.includes(value);
}
