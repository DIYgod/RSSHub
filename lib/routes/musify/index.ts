import type { Cheerio, CheerioAPI } from 'cheerio';
import { load } from 'cheerio';
import type { Element } from 'domhandler';
import type { Context } from 'hono';

import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import { ViewType } from '@/types';
import ofetch from '@/utils/ofetch';
import { getPlaywrightPage } from '@/utils/playwright';
import { getRouteLimit } from '@/utils/route-limit';
import { isValidHost } from '@/utils/valid-host';

const audioTypes = {
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    ogg: 'audio/ogg',
    wav: 'audio/vnd.wave',
} satisfies Record<string, string>;
const isAudioExtension = (key: string): key is keyof typeof audioTypes => Object.hasOwn(audioTypes, key);

async function fetchList(url: string) {
    const response = await ofetch<string>(url);
    if (!/location\.replace\(["']\/__mzverify\?/.test(response)) {
        return response;
    }

    const { page, destroy } = await getPlaywrightPage(url, {
        closeTimeout: 0,
        onBeforeLoad: async (page) => {
            await page.route('**/*', (route) => (['document'].includes(route.request().resourceType()) ? route.continue() : route.abort()));
        },
    });
    try {
        await page.waitForSelector('div.playlist__item');
        return await page.content();
    } finally {
        await destroy();
    }
}

export const handler = async (ctx: Context): Promise<Data> => {
    const { language = '' } = ctx.req.param();
    if (language && !isValidHost(language)) {
        throw new InvalidParameterError('Invalid language');
    }

    const limit = getRouteLimit(ctx, 30);

    const baseUrl = 'https://musify.club';
    const targetUrl: string = new URL(language, baseUrl).href;

    const response = await fetchList(targetUrl);
    const $: CheerioAPI = load(response);

    const items: DataItem[] = $('div.playlist__item')
        .slice(0, limit)
        .toArray()
        .map((el) => {
            const $el: Cheerio<Element> = $(el);

            const artist: string | undefined = $el.attr('data-artist');
            const name: string | undefined = $el.attr('data-name');

            const title: string = [artist, name].filter(Boolean).join(' - ');
            const linkUrl: string | undefined = $el.find('a.strong, .tracklist__title a').first().attr('href');
            const authorEls: Element[] = $el.find('div.playlist__heading a, .tracklist__artist a').toArray();
            const authors: DataItem['author'] = authorEls.map((authorEl) => {
                const $authorEl: Cheerio<Element> = $(authorEl);
                const authorHref: string | undefined = $authorEl.attr('href');

                return {
                    name: $authorEl.text(),
                    url: authorHref ? new URL(authorHref, baseUrl).href : undefined,
                    avatar: undefined,
                };
            });

            let processedItem: DataItem = {
                title,
                link: linkUrl ? new URL(linkUrl, baseUrl).href : undefined,
                author: authors,
            };

            const $enclosureEl: Cheerio<Element> = $el.find('div.playlist__control');
            const enclosureUrl: string | undefined = $enclosureEl.attr('data-play-url') ?? $el.find('[data-player-row-play]').attr('data-url');

            if (enclosureUrl) {
                const enclosure = new URL(enclosureUrl, baseUrl);
                const extension = enclosure.pathname.split('.').pop()?.toLowerCase() ?? '';
                processedItem = {
                    ...processedItem,
                    enclosure_url: enclosure.href,
                    enclosure_type: isAudioExtension(extension) ? audioTypes[extension] : undefined,
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
        language: {
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
        requirePuppeteer: true,
        antiCrawler: true,
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
            title: 'Последняя',
            source: ['musify.club'],
            target: '/',
        },
    ],
    view: ViewType.Articles,
};
