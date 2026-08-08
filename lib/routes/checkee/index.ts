import { load } from 'cheerio';
import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseRelativeDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/:dispdate',
    categories: ['other'],
    example: '/checkee/2019-03',
    parameters: { dispdate: 'Year-month of visa check，for example 2019-03' },
    name: 'US Visa check status',
    maintainers: ['lalxyy'],
    handler,
};

const host = 'https://www.checkee.info';

async function handler(ctx: Context) {
    const { dispdate } = ctx.req.param();

    const link = `${host}/main.php?dispdate=${dispdate}`;
    const response = await ofetch(link);
    const $ = load(response);

    const list = $(':nth-child(11) tbody tr')
        .toArray()
        .map((row) => {
            const $row = $(row);
            const completeDate = $row.find(':nth-child(9)').text();
            return {
                id: $row.find(':nth-child(2)').text(),
                visaType: $row.find(':nth-child(3)').text(),
                visaEntry: $row.find(':nth-child(4)').text(),
                usConsulate: $row.find(':nth-child(5)').text(),
                major: $row.find(':nth-child(6)').text(),
                status: $row.find(':nth-child(7)').text(),
                checkDate: $row.find(':nth-child(8)').text(),
                completeDate: completeDate === '0000-00-00' ? 'Not Completed' : completeDate,
                link: $row.find(':nth-child(11) a').attr('href'),
                note: $row.find(':nth-child(11) a').attr('title') || '',
            };
        });
    list.shift();

    const out = list.map((item) => {
        const title =
            `${item.visaType} ${item.visaEntry}, ${item.usConsulate}, ` +
            `Major ${item.major}, ${item.status}. Check date: ${item.checkDate}` +
            (item.completeDate === 'Not Completed' ? '' : `, Complete: ${item.completeDate}`) +
            ` | ID: ${item.id}`;

        return {
            title,
            link: new URL(item.link!, host).href,
            description: item.note === '' ? title : item.note,
            pubDate: timezone(parseRelativeDate(item.checkDate), 8),
        };
    });

    return {
        title: `Check Reporter Results: ${dispdate}`,
        link,
        item: out,
    };
}
