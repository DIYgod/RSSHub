import { Route } from '@/types';

import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
dayjs.extend(customParseFormat);
import { art } from '@/utils/render';
import path from 'node:path';
const renderDesc = (content) => art(path.join(__dirname, 'templates/description.art'), content);

export const route: Route = {
    path: '/pair/:source/:target',
    categories: ['other'],
    example: '/wise/pair/GBP/USD',
    parameters: { source: 'Base currency abbreviation', target: 'Quote currency abbreviation' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'FX Pair Yesterday',
    maintainers: ['HenryQW'],
    handler,
    description: `Refer to [the list of supported currencies](https://wise.com/tools/exchange-rate-alerts/).`,
};

async function handler(ctx) {
    let yesterday = dayjs().subtract(1, 'day');
    const dayBefore = yesterday.subtract(1, 'day').format('YYYY-MM-DD');
    yesterday = yesterday.format('YYYY-MM-DD');

    const source = ctx.req.param('source').toUpperCase();
    const target = ctx.req.param('target').toUpperCase();

    const link = 'https://wise.com/tools/exchange-rate-alerts/';
    const guid = `wise:rates:${ctx.req.param('source')}-${ctx.req.param('target')}-${yesterday}`;
    const single = await cache.tryGet(guid, async () => {
        const { data } = await got('https://wise.com/rates/history', {
            searchParams: {
                source,
                target,
                length: 1,
                unit: 'year',
                resolution: 'daily',
            },
            headers: {
                referer: link,
            },
        });

        const yData = data.at(-1);
        const byDate = data.at(-2);
        const yRate = yData.value;
        const byRate = byDate.value;
        const trend = yRate > byRate;
        const diff = (yRate - byRate) / yRate;

        const percent = (Math.abs(diff) * 100).toFixed(4);

        return {
            title: `${source}/${target} ${trend ? '📈' : '📉'} @${yRate} ${diff > 0 ? '' : '-'}${percent}%`,
            description: renderDesc({
                source,
                target,
                yesterday,
                yRate,
                dayBefore,
                byRate,
            }),
            pubDate: parseDate(yData.time, 'x'),
            guid,
            link,
        };
    });

    return {
        title: `${source} to ${target} by Wise`,
        link,
        description: `Exchange Rate from Wise`,
        item: [single],
    };
}
