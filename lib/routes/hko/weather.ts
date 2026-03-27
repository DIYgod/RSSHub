import * as cheerio from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const handler = async () => {
    const url = 'http://rss.weather.gov.hk/rss/CurrentWeather.xml';
    const pageUrl = 'https://www.weather.gov.hk/en/wxinfo/currwx/current.htm';

    const data = await ofetch(url);
    const $ = cheerio.load(data, {
        xmlMode: true,
    });

    const description = $('item').first().find('description');

    const $$ = cheerio.load(description.text());

    const items = $$('table tr')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const area = $item.find('td').first().text();
            const degree = $item.find('td').last().text();

            return {
                title: area,
                description: degree,
                pubDate: parseDate($('pubDate').text()),
                link: pageUrl,
                guid: `${$('guid').text()}#${area}`,
            };
        });

    return {
        title: 'Current Weather Report',
        description: `provided by the Hong Kong Observatory: ${$('pubDate').text()}`,
        link: pageUrl,
        item: items,
    };
};

export const route: Route = {
    path: '/weather',
    radar: [
        {
            source: ['www.weather.gov.hk/en/wxinfo/currwx/current.htm'],
        },
    ],
    name: 'Current Weather Report',
    example: '/hko/weather',
    maintainers: ['calpa'],
    categories: ['forecast'],
    handler,
    url: 'www.weather.gov.hk/en/wxinfo/currwx/current.htm',
};
