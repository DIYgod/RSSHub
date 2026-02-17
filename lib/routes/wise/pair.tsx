import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import { renderToString } from 'hono/jsx/dom/server';

import type { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(customParseFormat);
const renderDesc = (content) =>
    renderToString(
        <>
            <h3>
                {content.source} to {content.target}
            </h3>
            <table>
                <tbody>
                    <tr>
                        <th align="left" style="border: 1px solid black;">
                            Date
                        </th>
                        <th align="left" style="border: 1px solid black;">
                            Rate
                        </th>
                    </tr>
                    <tr>
                        <td style="border: 1px solid black;">{content.yesterday}</td>
                        <td style="border: 1px solid black;">{content.yRate}</td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid black;">{content.dayBefore}</td>
                        <td style="border: 1px solid black;">{content.byRate}</td>
                    </tr>
                </tbody>
            </table>
        </>
    );

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
