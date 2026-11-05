import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';
import timezone from '@/utils/timezone';

const createSearchParams = (queryString: string, limit: number = 30): URLSearchParams => {
    const params = new URLSearchParams(queryString);
    params.set('offset', '0');
    params.set('limit', limit.toString());
    return params;
};

export const handler = async (ctx: Context): Promise<Data> => {
    const { filters } = ctx.req.param();
    const limit = getRouteLimit(ctx, 30);
    const params: URLSearchParams = createSearchParams(filters, ctx.req.query('sorted') === 'false' ? limit : Math.max(30, limit));

    const baseUrl = 'https://digitalpolicyalert.org';
    const apiBaseUrl = 'https://api.globaltradealert.org';
    const targetUrl: string = new URL(`activity-tracker?${params.toString()}`, baseUrl).href;
    // Reason: trailing slash avoids a 301 redirect from the API server
    const apiUrl: string = new URL('dpa/intervention/', apiBaseUrl).href;

    // Reason: explicit Accept header needed because RSSHub's ofetch auto-generates
    // browser-like Accept headers, causing the API to return HTML via content negotiation
    const response = await ofetch(apiUrl, {
        query: Object.fromEntries(params),
        headers: {
            Accept: 'application/json',
        },
    });

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = response.results.map((item): DataItem => {
        const title: string = item.title;
        const description: string | undefined = item.latest_event?.description;
        const pubDate: number | string = item.latest_event?.date;
        const linkUrl: string | undefined = item.slug ? `change/${item.slug}` : undefined;
        const categories: string[] = [
            ...new Set([
                ...(item.economic_activities?.map((activity) => activity.name) ?? []),
                ...(item.implementers?.map((implementer) => implementer.name) ?? []),
                ...(item.policies?.map((policy) => policy.name) ?? []),
                item.status?.name,
                item.intervention_type?.name,
            ]),
        ].filter(Boolean);
        const authors: DataItem['author'] = item.implementers?.map((author) => ({
            name: author.name,
            url: undefined,
            avatar: undefined,
        }));

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? timezone(parseDate(pubDate), 0) : undefined,
            link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
            category: categories,
            author: authors,
            content: {
                html: description,
                text: description,
            },
            language,
        };

        return processedItem;
    });
    if (ctx.req.query('sorted') !== 'false') {
        items = items.toSorted((a, b) => (b.pubDate ? new Date(b.pubDate).getTime() : 0) - (a.pubDate ? new Date(a.pubDate).getTime() : 0));
    }
    items = items.slice(0, limit);

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content') ? new URL($('meta[property="og:image"]').attr('content')!, baseUrl).href : undefined,
        author: $('meta[property="og:site_name"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/activity-tracker/:filters?',
    name: 'Activity Tracker',
    url: 'digitalpolicyalert.org',
    maintainers: ['nczitzk', 'pseudoyu'],
    handler,
    example: '/digitalpolicyalert/activity-tracker',
    parameters: {
        filters: {
            description: 'Filter, all by default',
        },
    },
    description: `::: tip
To subscribe to [Activity Tracker - International trade](https://digitalpolicyalert.org/activity-tracker?policy=1), where the source URL is \`https://digitalpolicyalert.org/activity-tracker?policy=1\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/digitalpolicyalert/activity-tracker/policy=1\`](https://rsshub.app/digitalpolicyalert/activity-tracker/policy=1).
:::`,
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
            source: ['digitalpolicyalert.org', 'digitalpolicyalert.org/activity-tracker', 'digitalpolicyalert.org/change/:slug'],
            target: '/activity-tracker',
        },
    ],
    view: ViewType.Articles,
};
