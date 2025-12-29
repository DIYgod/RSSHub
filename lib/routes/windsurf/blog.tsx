import type { CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '10', 10);

    const baseUrl: string = 'https://windsurf.com';
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
    const language = $('html').attr('lang') ?? 'en';

    const title: string = $('title').first().text();
    const author: string | undefined = title.split(/\|/).pop()?.trim();

    const items: DataItem[] = response.posts.slice(0, limit).map((item): DataItem => {
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
        const authors: DataItem['author'] = item.authors.map((author) => ({
            name: author,
            url: undefined,
            avatar: undefined,
        }));
        const guid: string | undefined = item.slug ? `windsurf-blog-${item.slug}` : undefined;
        const updated: number | string = pubDate;

        const processedItem: DataItem = {
            title,
            description,
            pubDate: pubDate ? parseDate(pubDate) : undefined,
            link: linkUrl ? new URL(`blog/${linkUrl}`, baseUrl).href : undefined,
            category: categories,
            author: authors,
            guid,
            id: guid,
            content: {
                html: description,
                text: description,
            },
            image,
            banner: image,
            updated: updated ? parseDate(updated) : undefined,
            language,
        };

        return processedItem;
    });

    return {
        title,
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author,
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
