import { type Cheerio, type CheerioAPI, load } from 'cheerio';
import type { Element } from 'domhandler';
import { type Context } from 'hono';

import { type Data, type DataItem, type Route, ViewType } from '@/types';
import ofetch from '@/utils/ofetch';

export const handler = async (ctx: Context): Promise<Data> => {
    const { language = '' } = ctx.req.param();
    const limit: number = Number.parseInt(ctx.req.query('limit') ?? '30', 10);

    const baseUrl: string = 'https://musify.club';
    const targetUrl: string = new URL(language, baseUrl).href;

    const response = await ofetch(targetUrl);
    const $: CheerioAPI = load(response);

    const items: DataItem[] = $('div.playlist__item')
        .slice(0, limit)
        .toArray()
        .map((el): Element => {
            const $el: Cheerio<Element> = $(el);

            const artist: string | undefined = $el.attr('data-artist');
            const name: string | undefined = $el.attr('data-name');

            const title: string = [artist, name].filter(Boolean).join(' - ');
            const linkUrl: string | undefined = $el.find('a.strong').attr('href');
            const authorEls: Element[] = $el.find('div.playlist__heading a').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);

                return {
                    name: $authorEl.text(),
                    url: $authorEl.attr('href') ? new URL($authorEl.attr('href') as string, baseUrl).href : undefined,
                    avatar: undefined,
                };
            });

            let processedItem: DataItem = {
                title,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
            };

            const $enclosureEl: Cheerio<Element> = $el.find('div.playlist__control');
            const enclosureUrl: string | undefined = $enclosureEl.attr('data-play-url');

            if (enclosureUrl) {
                processedItem = {
                    ...processedItem,
                    enclosure_url: new URL(enclosureUrl, baseUrl).href,
                    enclosure_type: `audio/${enclosureUrl.split(/\./).pop()}`,
                    enclosure_title: title,
                    enclosure_length: undefined,
                    itunes_duration: undefined,
                    itunes_item_image: undefined,
                };
            }

            return processedItem;
        });

    return {
        title: $('title').text(),
        description: $('meta[property="og:description"]').attr('content'),
        link: targetUrl,
        item: items,
        allowEmpty: true,
        image: $('meta[property="og:image"]').attr('content'),
        author: $('meta[property="og:site_name"]').attr('content'),
        id: $('meta[property="og:url"]').attr('content'),
    };
};

export const route: Route = {
    path: '/:language?',
    name: 'Latest',
    url: 'musify.club',
    maintainers: ['nczitzk'],
    handler,
    example: '/musify/en',
    parameters: {
        category: {
            description: 'Language, Russian by default',
            options: [
                {
                    label: 'Russian',
                    value: '',
                },
                {
                    label: 'English',
                    value: 'en',
                },
            ],
        },
    },
    description: `::: tip
To subscribe to [Latest](https://musify.club/en), where the source URL is \`https://musify.club/en\`, extract the certain parts from this URL to be used as parameters, resulting in the route as [\`/musify/en\`](https://rsshub.app/musify/en).
:::`,
    categories: ['multimedia'],
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
            source: ['musify.club/:language'],
            target: '/:language',
        },
        {
            title: 'Latest',
            source: ['musify.club/en'],
            target: '/en',
        },
        {
            title: '​​Последняя',
            source: ['musify.club'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
