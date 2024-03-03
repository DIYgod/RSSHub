// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

import got from '@/utils/got';
import { art } from '@/utils/render';
import * as path from 'node:path';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const response = await got('https://www.cngal.org/api/news/GetWeeklyNewsOverview');

    ctx.set('data', {
        title: 'CnGal - 每周速报',
        link: 'https://www.cngal.org/weeklynews',
        item: response.data.map((item) => ({
            title: item.name,
            description: art(path.join(__dirname, 'templates/weekly-description.art'), item),
            pubDate: parseDate(item.lastEditTime),
            link: `https://www.cngal.org/articles/index/${item.id}`,
        })),
    });
    ctx.state.json = response.data;
};
