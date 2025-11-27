import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const { id = 'trending' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '50', 10);

    const apiSlug = 'wp-json/wp/v2';
    const baseUrl: string = 'https://indianexpress.com';
    const apiUrl = new URL(`${apiSlug}/article`, baseUrl).href;
    const apiSearchUrl = new URL(`${apiSlug}/ie_section`, baseUrl).href;

    const searchResponse = await ofetch(apiSearchUrl, {
        query: {
            search: id,
        },
    });

    const sectionObj = searchResponse.find((c) => c.slug === id || c.name === id || id.includes(c.slug));
    const sectionId: number | undefined = sectionObj?.id ?? undefined;
    const sectionLink: string | undefined = sectionObj?.link ?? undefined;

    const response = await ofetch(apiUrl, {
        query: {
            _embed: 'true',
            per_page: limit,
            ie_section: sectionId,
        },
    });

    const targetUrl: string = sectionLink ?? new URL(`section/${id.endsWith('/') ? id : `${id}/`}`, baseUrl).href;

    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = $('html').attr('lang') ?? 'en';

    let items: DataItem[] = [];

    items = response.slice(0, limit).map((item): DataItem => {
        const title: string = item.title?.rendered ?? item.title;
        const description: string | undefined = item.content.rendered;
        const pubDate: number | string = item.date_gmt;
        const linkUrl: string | undefined = item.link;

        const terminologies = item._embedded?.['wp:term'];

        const categories: string[] = terminologies?.flat().map((c) => c.name) ?? [];
        const guid: string = item.guid?.rendered ?? item.guid;
        const updated: number | string = item.modified_gmt ?? pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ?? guid,
            category: categories,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    const author: string | undefined = $('meta[property="og:site_name"]').attr('content') || $('meta[property="og:title"]').attr('content');

    return {
        title: `${author ? `${author} - ` : ''}${sectionObj?.name ?? id}`,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author,
        language,
        feedLink: $('link[type="application/rss+xml"]').attr('href'),
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/section/:id{.+}?',
    name: 'Section',
    url: 'indianexpress.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/indianexpress/section/explained',
    parameters: {
        id: {
            description: 'Section ID, `trending` as Trending by default',
        },
    },
    description: `:::tip
To subscribe to [Section](https://indianexpress.com/), where the source URL is \`https://indianexpress.com/\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/indianexpress/section/explained\`](https://rsshub.app/indianexpress/section/explained).
:::
`,
    categories: ['new-media'],
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
            source: ['indianexpress.com/section/:id'],
            target: '/section/:id',
        },
    ],
    view: ViewType.Articles,
};
