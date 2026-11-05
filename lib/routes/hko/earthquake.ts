import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/earthquake',
    name: '全球地震資訊網',
    maintainers: ['after9'],
    handler,
    example: '/hko/earthquake',
    categories: ['forecast'],
    description: '来自香港天文台的全球 5 级以上地震记录',
};

async function handler() {
    const title = '来自香港天文台的全球5级以上地震记录';
    const link = 'https://www.hko.gov.hk/tc/gts/equake/quake-info.htm';
    const description = '提供經天文台分析的全球5.0級或以上及本地有感的地震資訊。';

    // Fetch the current earthquake records.
    const response = await ofetch('https://www.hko.gov.hk/gts/QEM/eq_app-30d_uc.xml', {
        headers: {
            accept: 'application/xml',
        },
    });

    const $ = load(response);

    const items = $('Earthquake > EventGroup > Event')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const degree = $item.find('Mag').text();
            const city = $item.find('City').text();
            const cityString = $item.find('citystring').text();
            const hktDate = $item.find('HKTDate').text();
            const hktTime = $item.find('HKTTime').text();
            const eventId = $item.find('EventId').text();
            const pubDate = hktDate && hktTime ? timezone(parseDate(hktDate + hktTime, 'YYYYMMDDHHmm'), 8) : undefined;
            if (!eventId) {
                throw new Error('The Hong Kong Observatory earthquake source is missing an event ID.');
            }
            const latAndLon = '經緯:[' + $item.find('Lat').text() + ',' + $item.find('Lon').text() + ']';
            return {
                title: `[震級:${degree}] [地點:${city}]`,
                link,
                guid: `hko-earthquake-${eventId}`,
                description: `${cityString}, ${latAndLon}`,
                pubDate: pubDate && !Number.isNaN(pubDate.getTime()) ? pubDate : undefined,
            };
        });

    return {
        title,
        link,
        description,
        item: items,
    };
}
