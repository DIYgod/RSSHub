import type { DataItem, Route } from '@/types';
import got from '@/utils/got';
import { parseRelativeDate } from '@/utils/parse-date';

const rootUrl = 'https://colorhunt.co';

type Palette = {
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
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['colorhunt.co/popular'],
            target: '/popular/monthly',
        },
    ],
    name: 'Monthly Popular',
    maintainers: ['Noteles'],
    handler,
    url: 'colorhunt.co/popular',
    description: 'Monthly popular color palettes.',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 30;

    const { data } = await got.post(`${rootUrl}/php/feed.php`, {
        form: {
            step: '0',
            sort: 'popular',
            tags: '',
            timeframe: '30',
        },
        headers: {
            referer: `${rootUrl}/popular`,
        },
    });
    const palettes = data as Palette[];

    const items = palettes.slice(0, limit).map((palette) => {
        const colors = getColors(palette.code);
        const link = `${rootUrl}/palette/${palette.code}`;

        return {
            title: colors.join(' '),
            description: renderPalette(colors),
            summary: `${palette.likes} likes - ${palette.date}`,
            pubDate: parsePaletteDate(palette.date),
            link,
            guid: palette.code,
        } satisfies DataItem;
    });

    return {
        title: 'Color Hunt - Monthly Popular',
        description: 'Monthly popular color palettes from Color Hunt.',
        link: `${rootUrl}/popular`,
        item: items,
        language: 'en',
        logo: `${rootUrl}/img/colorhunt-favicon.svg?2`,
        icon: `${rootUrl}/img/colorhunt-favicon.svg?2`,
    };
}

function getColors(code: string): string[] {
    return code.match(/.{6}/g)?.map((color) => `#${color.toUpperCase()}`) ?? [];
}

function renderPalette(colors: string[]): string {
    const swatches = colors.map((color) => `<div style="height:64px;background:${color};display:flex;align-items:center;justify-content:center;font-family:monospace;color:${getTextColor(color)}">${color}</div>`).join('');

    return `<div style="max-width:360px;border-radius:8px;overflow:hidden">${swatches}</div>`;
}

function getTextColor(color: string): string {
    const red = Number.parseInt(color.slice(1, 3), 16);
    const green = Number.parseInt(color.slice(3, 5), 16);
    const blue = Number.parseInt(color.slice(5, 7), 16);

    return red * 0.299 + green * 0.587 + blue * 0.114 > 186 ? '#000000' : '#FFFFFF';
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
