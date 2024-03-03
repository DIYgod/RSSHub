// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { isValidHost } from '@/utils/valid-host';

export default async (ctx) => {
    const lang = ctx.req.param('lang');
    const type = ctx.req.param('type') ?? 'all';

    if (!isValidHost(lang)) {
        throw new Error('Invalid lang');
    }

    const response = await got({
        method: 'get',
        url: `https://lodestonenews.com/news/${type}?locale=${lang}`,
    });

    let data;
    if (type === 'all') {
        data = [];
        for (const arr of Object.values(response.data)) {
            data = [...data, ...arr];
        }
    } else {
        data = response.data;
    }

    ctx.set('data', {
        title: `FFXIV Lodestone updates (${type})`,
        link: `https://${lang}.finalfantasyxiv.com/lodestone/news/`,
        item: data.map(({ id, url, title, time, description, image }) => ({
            title,
            link: url,
            description: art(path.join(__dirname, 'templates/description.art'), {
                image,
                description,
            }),
            pubDate: parseDate(time),
            guid: id,
        })),
    });
};
