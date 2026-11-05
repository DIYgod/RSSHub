import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

const titleMap = {
    date: 'Newest',
    popularity: 'Most Popular',
    trending: 'Trending',
    alpha: 'Name',
    style: 'Number of styles',
};

export const route: Route = {
    path: '/fonts/:sort?',
    categories: ['design'],
    example: '/google/fonts/date',
    parameters: { sort: 'Sorting type, see below, default to `date`' },
    features: {
        requireConfig: [
            {
                name: 'GOOGLE_FONTS_API_KEY',
                description: '',
            },
        ],
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Fonts',
    maintainers: ['Fatpandac'],
    handler,
    description: `| Newest | Trending | Most popular |  Name | Number of styles |
| :----: | :------: | :----------: | :---: | :--------------: |
|  date  | trending |  popularity  | alpha |       style      |

::: warning
This route requires API key, therefore it's only available when self-hosting, refer to the [Deploy Guide](https://docs.rsshub.app/deploy/config#route-specific-configurations) for route-specific configurations.
:::`,
};

async function handler(ctx) {
    const sort = ctx.req.param('sort') ?? 'date';
    if (!Object.hasOwn(titleMap, sort)) {
        throw new InvalidParameterError(`Unknown Google Fonts sort "${sort}". Available sorts: ${Object.keys(titleMap).join(', ')}.`);
    }
    const limit = Math.max(25, getRouteLimit(ctx, 25));

    const apiKey = config.google.fontsApiKey;
    if (!apiKey) {
        throw new ConfigNotFoundError('Google Fonts API key is required.');
    }

    const googleFontsApi = `https://www.googleapis.com/webfonts/v1/webfonts?sort=${sort}&key=${apiKey}`;

    const response = await got.get(googleFontsApi);
    const data = response.data.items.slice(0, limit);

    return {
        title: `Google Fonts - ${titleMap[sort]}`,
        link: 'https://fonts.google.com',
        item:
            data &&
            data.map((item: WebFont) => {
                const updated = item.lastModified ? parseDate(`${item.lastModified}T00:00:00Z`) : undefined;
                return {
                    title: item.family,
                    description: renderDescription(item),
                    category: item.category ? [item.category] : undefined,
                    link: `https://fonts.google.com/specimen/${item.family.replaceAll(/\s/g, '+')}`,
                    updated: updated && !Number.isNaN(updated.getTime()) ? updated : undefined,
                };
            }),
    };
}

interface WebFont {
    family: string;
    category: string;
    version: string;
    lastModified: string;
    subsets?: string[];
    files?: Record<string, string>;
}

const renderDescription = (item: WebFont): string =>
    renderToString(
        <>
            <text>Subsets: {item.subsets?.join(',')}</text>
            <br />
            <text>Version: {item.version}</text>
            <br />
            <strong>File:</strong>
            <br />
            {Object.entries(item.files ?? {}).map(([key, value]) => (
                <>
                    <a href={value}>{key}</a>&nbsp;&nbsp;
                </>
            ))}
        </>
    );
