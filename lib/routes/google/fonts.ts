// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { config } from '@/config';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

const titleMap = {
    date: 'Newest',
    popularity: 'Most Popular',
    trending: 'Trending',
    alpha: 'Name',
    style: 'Number of styles',
};

export default async (ctx) => {
    const sort = ctx.req.param('sort') ?? 'date';
    const limit = ctx.req.param('limit') ?? 25;

    const API_KEY = config.google.fontsApiKey;
    if (!API_KEY) {
        throw new Error('Google Fonts API key is required.');
    }

    const googleFontsAPI = `https://www.googleapis.com/webfonts/v1/webfonts?sort=${sort}&key=${API_KEY}`;

    const response = await got.get(googleFontsAPI);
    const data = response.data.items.slice(0, limit);

    ctx.set('data', {
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
    });
};
