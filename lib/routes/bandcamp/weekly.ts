// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { art } from '@/utils/render';
import * as path from 'node:path';

export default async (ctx) => {
    const rootUrl = 'https://bandcamp.com';
    const apiUrl = `${rootUrl}/api/bcweekly/3/list`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const items = response.data.results.slice(0, 50).map((item) => ({
        title: item.title,
        link: `${rootUrl}/?show=${item.id}`,
        pubDate: parseDate(item.published_date),
        description: art(path.join(__dirname, 'templates/weekly.art'), {
            v2_image_id: item.v2_image_id,
            desc: item.desc,
        }),
    }));

    ctx.set('data', {
        title: 'Bandcamp Weekly',
        link: rootUrl,
        item: items,
    });
};
