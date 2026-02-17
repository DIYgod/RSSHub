import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const createSearchParams = (queryString: string, limit: number = 30): URLSearchParams => {
    const params = new URLSearchParams(queryString);
    params.set('offset', '0');
    params.set('limit', limit.toString());
    return params;
};

const searchParamsToObject = (searchParams: URLSearchParams): Record<string, string> => {
    const obj: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
        obj[key] = value;
    }
    return obj;
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { filters } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);
    const params: URLSearchParams = createSearchParams(filters, limit);

    const baseUrl = 'https://digitalpolicyalert.org';
    const apiBaseUrl = 'https://api.globaltradealert.org';
    const targetUrl: string = new URL(`activity-tracker?${params.toString()}`, baseUrl).href;
    const apiUrl: string = new URL('dpa/intervention', apiBaseUrl).href;

    const response = await ofetch(apiUrl, {
        query: searchParamsToObject(params),
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = response.results.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const description: string | undefined = item.latest_event?.description ?? undefined;
        const pubDate: number | string = item.latest_event?.date;
        const linkUrl: string | undefined = item.slug ? `change/${item.slug}` : undefined;
        const categories: string[] = [
            ...new Set([
                ...(item.economic_activities?.map((activity) => activity.name) ?? []),
                ...(item.implementers?.map((implementer) => implementer.name) ?? []),
                ...(item.policies?.map((policy) => policy.name) ?? []),
                item.status?.name,
                item.type?.name,
            ]),
        ].filter(Boolean);
        const authors: DataItem['author'] =
            item.implementers?.map((author) => ({
                name: author.name,
                url: undefined,
                avatar: undefined,
            })) ?? undefined;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
            category: categories,
            author: authors,
            content: {
                html: description,
                text: description,
            },
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content') ? new URL($('meta[property="og:image"]').attr('content'), baseUrl).href : undefined,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/activity-tracker/:filters?',
    name: 'Activity Tracker',
    url: 'digitalpolicyalert.org',
    maintainers: ['nczitzk'],
    handler,
    example: '/digitalpolicyalert/activity-tracker',
    parameters: {
        filter: {
            description: 'Filter, all by default',
        },
    },
    description: `::: tip
To subscribe to [Activity Tracker - International trade](https://digitalpolicyalert.org/activity-tracker?policy=1), where the source URL is \`https://digitalpolicyalert.org/activity-tracker?policy=1\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/digitalpolicyalert/activity-tracker/policy=1\`](https://rsshub.app/digitalpolicyalert/activity-tracker/policy=1).
:::
`,
    categories: ['other'],
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportRadar: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['digitalpolicyalert.org'],
            target: (_, url) => {
                const urlObj: URL = new URL(url);
                const filters: string = createSearchParams(urlObj.searchParams.toString()).toString();

                return `/digitalpolicyalert/activity-tracker${filters ? `/${filters}` : ''}`;
            },
        },
    ],
    view: ViewType.Articles,
};
