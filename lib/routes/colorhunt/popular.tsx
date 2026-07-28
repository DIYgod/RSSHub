import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';

import Palette from './templates/palette';

const rootUrl = 'https://colorhunt.co';
const popularUrl = `${rootUrl}/palettes/popular`;

type PaletteResponse = {
    code: string;
    likes: string;
    date: string;
};

export const route: Route = {
    path: '/popular/monthly',
    categories: ['design'],
    example: '/colorhunt/popular/monthly',
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: true,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['colorhunt.co/palettes/popular'],
            target: '/popular/monthly',
        },
    ],
    name: 'Monthly Popular',
    maintainers: ['Noteles'],
    handler,
    url: 'colorhunt.co/palettes/popular',
    description: 'Monthly popular color palettes.',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 30;
    const cookies = await getCookies();
    const headers: Record<string, string> = {
        accept: '*/*',
        origin: rootUrl,
        referer: popularUrl,
        'user-agent': config.trueUA,
        'x-requested-with': 'XMLHttpRequest',
    };

    if (cookies.length > 0) {
        headers.cookie = cookies.join('; ');
    }

    const { data } = await got.post(`${rootUrl}/php/feed.php`, {
        form: {
            step: '0',
            sort: 'popular',
            tags: '',
            timeframe: '30',
        },
        headers,
    });
    const palettes = data as PaletteResponse[];

    const items = palettes.slice(0, limit).map((palette) => {
        const colors = getColors(palette.code);
        const link = `${rootUrl}/palette/${palette.code}`;

        return {
            title: colors.join(' '),
            description: renderToString(<Palette colors={colors} />),
            summary: `${palette.likes} likes - ${palette.date}`,
            pubDate: parsePaletteDate(palette.date),
            link,
            guid: palette.code,
        } satisfies DataItem;
    });

    return {
        title: 'Color Hunt - Monthly Popular',
        description: 'Monthly popular color palettes from Color Hunt.',
        link: popularUrl,
        item: items,
        language: 'en',
        logo: `${rootUrl}/img/colorhunt-favicon.svg?2`,
        icon: `${rootUrl}/img/colorhunt-favicon.svg?2`,
    };
}

const getCookies = () =>
    cache.tryGet(
        'colorhunt:cookies',
        async () => {
            const response = await ofetch.raw(popularUrl, {
                headers: {
                    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'user-agent': config.trueUA,
                },
            });

            return response.headers.getSetCookie().map((cookie) => cookie.split(';', 1)[0]);
        },
        300,
        false
    );

function getColors(code: string): string[] {
    return code.match(/.{6}/g)?.map((color) => `#${color.toUpperCase()}`) ?? [];
}

function parsePaletteDate(date: string): Date | undefined {
    if (!date) {
        return;
    }

    if (/^(?:today|yesterday)$/i.test(date)) {
        return parseRelativeDate(date);
    }

    if (/^\d+\s+(?:seconds?|minutes?|hours?|days?|weeks?|months?|years?)$/i.test(date)) {
        return parseRelativeDate(`${date} ago`);
    }
}
