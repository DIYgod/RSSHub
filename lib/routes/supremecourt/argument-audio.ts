import { load } from 'cheerio';
import dayjs from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

export const route: Route = {
    path: '/argument_audio/:year?',
    categories: ['government'],
    example: '/supremecourt/argument_audio',
    parameters: { year: 'Year, current year by default' },
    name: 'Arguments Audios',
    maintainers: ['nczitzk'],
    handler,
};

async function handler(ctx: Context) {
    const { year = new Date().getFullYear() } = ctx.req.param();

    const rootUrl = 'https://www.supremecourt.gov';
    const imageUrl = `${rootUrl}/images/scous_seal.png`;
    const currentUrl = `${rootUrl}/oral_arguments/argument_audio/${year}`;
    const response = await ofetch(currentUrl);

    const $ = load(response);

    const list = $('.card-body table tbody tr td span a')
        .toArray()
        .map((item): DataItem => {
            const $item = $(item);
            return {
                title: $item.text(),
                link: new URL($item.attr('href')!, currentUrl).href,
            };
        });

    const items = await pMap(
        list,
        async (item) => {
            const { caseName, ...detail } = await cache.tryGet(`supremecourt:article:v2:${item.link}`, async () => {
                const detailResponse = await ofetch(item.link!);
                const content = load(detailResponse);

                content('#pagetitle').remove();
                const arguedDate = content('#ctl00_ctl00_MainEditable_mainContent_lblDate').text();
                const caseName = content('#ctl00_ctl00_MainEditable_mainContent_lblCaseName').text();
                content('#ctl00_ctl00_MainEditable_mainContent_lblCaseName').remove();
                const dateField = content('#ctl00_ctl00_MainEditable_mainContent_lblDate').closest('.datafield');
                dateField.prev('.tagname').remove();
                dateField.remove();
                content('audio source[type="audio/mp3"]').attr('type', 'audio/mpeg');

                return {
                    description: content('#pagemaindiv').html() ?? undefined,
                    caseName,
                    pubDate: arguedDate ? parseDate(dayjs.tz(arguedDate, 'MM/DD/YY', 'America/New_York').format()) : undefined,
                    itunes_item_image: imageUrl,
                    enclosure_url: content('audio source').attr('src'),
                    enclosure_type: 'audio/mpeg',
                };
            });
            return { ...item, ...detail, title: `${item.title} : ${caseName}` };
        },
        { concurrency: 3 }
    );

    return {
        title: `Argument Audio ${year} - Supreme Court of the United States`,
        link: currentUrl,
        item: items,
        itunes_author: 'Supreme Court of the United States',
        image: imageUrl,
    };
}
