import { type CheerioAPI, load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import { FetchError } from 'ofetch';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

function parsePublicationDate(value: string | number | undefined) {
    if (value === undefined || (typeof value === 'string' && !value.trim())) {
        return;
    }
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value) && !Number.isFinite(parseDate(value.slice(0, 10), 'YYYY-MM-DD', true).getTime())) {
        return;
    }
    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? date : undefined;
}
async function getArticleContent(link: string) {
    const response = await ofetch(link);
    const $ = load(response);
    const body = $('.blog-prose');
    if (body.length !== 1) {
        throw new Error(`Blog article content not found at ${link}`);
    }
    const description = body.html()!;
    const metadata = $('script[type="application/ld+json"]')
        .toArray()
        .map(
            (
                element
            ): {
                '@type'?: string;
                author?:
                    | Array<{
                          name?: string;
                      }>
                    | {
                          name?: string;
                      };
            } => JSON.parse($(element).text())
        )
        .find((record) => record['@type'] === 'BlogPosting');
    const sourceAuthor = metadata?.author;
    const authors = (Array.isArray(sourceAuthor) ? sourceAuthor : [sourceAuthor]).flatMap((author) => (author?.name?.trim() ? { name: author.name } : []));
    const author = authors.length === 1 ? authors[0].name : authors.length ? authors : undefined;
    return { description, content: { html: description, text: body.text() }, author };
}
export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 10);
    const baseUrl = 'https://windsurf.com';
    const targetUrl: string = new URL('blog', baseUrl).href;
    const apiUrl: string = new URL('api/blog', baseUrl).href;
    const response = await ofetch(apiUrl, {
        query: {
            paginate: limit,
            cursor: 0,
        },
    });
    const targetResponse = await ofetch(targetUrl);
    const $: CheerioAPI = load(targetResponse);
    const language = ($('html').attr('lang') ?? 'en') as Language;
    const title: string = $('title').first().text();
    const candidates: DataItem[] = response.posts.slice(0, limit).map((item): DataItem => {
        const title: string = item.title;
        const image: string | undefined = item.images?.[0];
        const description: string | undefined = renderToString(
            <>
                {image ? (
                    <figure>
                        <img src={image} alt={title} />
                    </figure>
                ) : null}
                {item.summary ? <blockquote>{item.summary}</blockquote> : null}
            </>
        );
        const pubDate: number | string = item.date;
        const linkUrl: string | undefined = item.slug;
        const categories: string[] = item.tags;
        const authors = item.authors.filter((author: string) => author && author !== 'default').map((author: string) => ({ name: author }));
        const guid: string | undefined = item.slug ? `windsurf-blog-${item.slug}` : undefined;
        const processedItem: DataItem = {
            title,
            description,
            pubDate: parsePublicationDate(pubDate),
            link: linkUrl ? new URL(`blog/${linkUrl}`, baseUrl).href : undefined,
            category: categories,
            author: authors.length ? authors : undefined,
            guid,
            id: guid,
            content: {
                html: description,
                text: item.summary,
            },
            image,
            banner: image,
            language,
        };
        return processedItem;
    });
    const items = await unwrapFirstFailure(
        pMap(
            candidates,
            async (item) => {
                if (!item.link) {
                    return item;
                }
                try {
                    const details = await cache.tryGet(`windsurf:blog:article-author:${item.link}`, () => getArticleContent(item.link!));
                    return { ...item, description: details.description, content: details.content, author: item.author ?? details.author };
                } catch (error) {
                    if (error instanceof FetchError && error.response?.status === 404) {
                        return item;
                    }
                    throw error;
                }
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        image: $('meta[property="og:image"]').attr('content'),
        language,
        id: $('meta[property="og:url"]').attr('content'),
    };
};
export const route: Route = {
    path: '/blog',
    name: 'Blog',
    url: 'windsurf.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/windsurf/blog',
    parameters: undefined,
    description: undefined,
    categories: ['programming'],
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
            source: ['windsurf.com/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
