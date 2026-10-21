import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDateInTimezone } from '@/utils/parse-date-in-timezone';
import { getRouteLimit } from '@/utils/route-limit';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit = getRouteLimit(ctx, 30);
    const baseUrl = 'https://mathpix.com';
    const targetUrl = new URL('blog', baseUrl).href;
    const response = await ofetch(targetUrl);
    const $ = load(response);
    const language = ($('html').attr('lang') ?? 'en') as Language;

    let items: DataItem[] = $('.blog-grid a.blog-post')
        .slice(0, limit)
        .toArray()
        .map((element) => {
            const card = $(element);
            const title = card.find('h3').text();
            const imageUrl = card.find('img').attr('src');
            const image = imageUrl ? new URL(imageUrl, baseUrl).href : undefined;
            const description = renderToString(
                <>
                    {image && (
                        <figure>
                            <img src={image} alt={title} />
                        </figure>
                    )}
                    {card.find('p').text() && <blockquote>{card.find('p').text()}</blockquote>}
                </>
            );
            const date = card.find('h3').prev('div').text();
            const pubDate = date ? parseDateInTimezone(date, 0) : undefined;
            return {
                title,
                description,
                pubDate,
                link: new URL(card.attr('href')!, baseUrl).href,
                category: [],
                content: { html: description, text: card.find('p').text() },
                image,
                banner: image,
                language,
            };
        });

    items = await pMap(
        items,
        async (item) => {
            const description = await cache.tryGet(`mathpix:article:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const detail = load(response);
                return detail('#setText').html() ?? undefined;
            });
            return { ...item, description, content: { html: description, text: description ? load(description).text() : undefined } };
        },
        { concurrency: 3 }
    );

    return {
        title: $('title').text(),
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
    url: 'mathpix.com',
    maintainers: ['nczitzk'],
    handler,
    example: '/mathpix/blog',
    parameters: undefined,
    description: undefined,
    categories: ['blog'],
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
            source: ['mathpix.com/blog'],
            target: '/blog',
        },
    ],
    view: ViewType.Articles,
};
