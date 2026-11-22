import { load } from 'cheerio';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';
import pMap from 'p-map';

import type { Data, DataItem, Language, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { getRouteLimit } from '@/utils/route-limit';
import { parseDate } from '@/utils/time';

const handler = async (ctx: Context): Promise<Data> => {
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
            return {
                title,
                description,
                pubDate: parseDate(card.find('h3').prev('div').text(), 0),
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
            const content = await cache.tryGet(`mathpix:article:v2:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const article = load(response)('#setText');
                return { html: article.html(), text: article.text() };
            });
            return { ...item, description: content.html, content };
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
