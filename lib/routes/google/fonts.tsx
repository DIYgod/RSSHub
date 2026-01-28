import { renderToString } from 'hono/jsx/dom/server';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

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
    name: 'Google Fonts',
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
    const limit = ctx.req.param('limit') ?? 25;

    const API_KEY = config.google.fontsApiKey;
    if (!API_KEY) {
        throw new ConfigNotFoundError('Google Fonts API key is required.');
    }

    const googleFontsAPI = `https://www.googleapis.com/webfonts/v1/webfonts?sort=${sort}&key=${API_KEY}`;

    const response = await got.get(googleFontsAPI);
    const data = response.data.items.slice(0, limit);

    return {
        title: `Google Fonts - ${titleMap[sort]}`,
        link: 'https://fonts.google.com',
        item:
            data &&
            data.map((item) => ({
                title: item.family,
                description: renderDescription(item),
                link: `https://fonts.google.com/specimen/${item.family.replaceAll(/\s/g, '+')}`,
                pubDate: parseDate(item.lastModified, 'YYYY-MM-DD'),
            })),
    };
}

const renderDescription = (item): string =>
    renderToString(
        <>
            <text>Family: {item.family}</text>
            <br />
            <text>Category: {item.category}</text>
            <br />
            <text>Subsets: {item.subsets?.join(',')}</text>
            <br />
            <text>Version: {item.version}</text>
            <br />
            <text>Last modified: {item.lastModified}</text>
            <br />
            <Strong>File:</Strong>
            <br />
            {Object.entries(item.files ?? {}).map(([key, value]) => (
                <>
                    <a href={value}>{key}</a>&nbsp;&nbsp;
                </>
            ))}
        </>
    );
