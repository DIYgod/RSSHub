import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';
import { renderToString } from 'hono/jsx/dom/server';

import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const handler = async (ctx: Context): Promise<Data> => {
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://mathpix.com';
    const targetUrl: string = new URL('blog', baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);
    const language = $('html').attr('lang') ?? 'en';

    const categoryMap = {};

    $('div.navbar-menu a.blog-category').each((_, el) => {
        const $el: Cheerio<Element> = $(el);

        const id: string = $el.attr('data-category');
        const name: string = $el.text()?.trim();

        if (id && name) {
            categoryMap[id] = name;
        }
    });

    let items: DataItem[] = [];

    items = $('li.articles__item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const title: string = $el.find('a.articles__title').text();
            const image: string | undefined = $el.find('div.articles__image img').attr('srcset') ? new URL($el.find('div.articles__image img').attr('srcset') as string, baseUrl).href : undefined;
            const description: string | undefined = renderToString(
                <>
                    {image ? (
                        <figure>
                            <img src={image} alt={title} />
                        </figure>
                    ) : null}
                    {$el.find('div.articles__text').text() ? <blockquote>{$el.find('div.articles__text').text()}</blockquote> : null}
                </>
            );
            const pubDateStr: string | undefined = $el.find('time.articles__date').attr('datetime');
            const linkUrl: string | undefined = $el.find('a.articles__title').attr('href');
            const categoryIds: string[] =
                $el
                    .attr('data-category')
                    ?.split(/,\s/)
                    .map((category) => category.trim()) ?? [];
            const categories: string[] = categoryIds.map((id) => categoryMap[id]).filter(Boolean);
            const upDatedStr: string | undefined = pubDateStr;

            const processedItem: DataItem = {
                title,
                description,
                pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                category: categories,
                content: {
                    html: description,
                    text: description,
                },
                image,
                banner: image,
                updated: upDatedStr ? parseDate(upDatedStr) : undefined,
                language,
            };

            return processedItem;
        });

    items = await Promise.all(
        items.map((item) => {
            if (!item.link) {
                return item;
            }

            return cache.tryGet(item.link, async (): Promise<DataItem> => {
                const detailResponse = await ofetch(item.link);
                const $$: CheerioAPI = load(detailResponse);

                const title: string = $$('h1.article__title').text();
                const description: string | undefined = $$('div#setText').html();

                const processedItem: DataItem = {
                    title,
                    description,
                    content: {
                        html: description,
                        text: description,
                    },
                    language,
                };

                return {
                    ...item,
                    ...processedItem,
                };
            });
        })
    );

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
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
