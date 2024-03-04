// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { load } from 'cheerio';
import { config } from '@/config';
import * as path from 'node:path';
import { art } from '@/utils/render';

export default async (ctx) => {
    const id = ctx.req.param('id');
    const link = `https://tophub.today/n/${id}`;
    const response = await got.get(link, {
        headers: {
            Referer: 'https://tophub.today',
            Cookie: config.tophub.cookie,
        },
    });
    const $ = load(response.data);
    const title = $('div.Xc-ec-L.b-L').text().trim();
    const items = $('div.Zd-p-Sc > div:nth-child(1) tr')
        .toArray()
        .map((e) => ({
            title: $(e).find('td.al a').text().trim(),
            link: $(e).find('td.al a').attr('href'),
            heatRate: $(e).find('td:nth-child(3)').text().trim(),
        }));
    const combinedTitles = items.map((item) => item.title).join('');
    const renderRank = art(path.join(__dirname, 'templates/rank.art'), { items });

    ctx.set('data', {
        title,
        link,
        item: [
            {
                title,
                link,
                description: renderRank,
                guid: combinedTitles,
            },
        ],
    });
};
