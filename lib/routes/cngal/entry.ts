// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export default async (ctx) => {
    const entryId = ctx.req.param('id');

    const response = await got(`https://www.cngal.org/api/entries/GetEntryView/${entryId}`);

    const data = response.data;

    ctx.set('data', {
        title: `CnGal - ${data.name} 的动态`,
        link: `https://www.cngal.org/entries/index/${entryId}`,
        item: data.newsOfEntry.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/entry-description.art'), item),
            pubDate: timezone(parseDate(item.happenedTime), +8),
            link: item.link,
        })),
    });
    ctx.set('json', response.data);
};
