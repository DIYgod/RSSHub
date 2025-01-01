import { Route } from '@/types';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import ConfigNotFoundError from '@/errors/types/config-not-found';

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
                description: art(path.join(__dirname, './templates/fonts.art'), {
                    item,
                }),
                link: `https://fonts.google.com/specimen/${item.family.replaceAll(/\s/g, '+')}`,
                pubDate: parseDate(item.lastModified, 'YYYY-MM-DD'),
            })),
    };
}
