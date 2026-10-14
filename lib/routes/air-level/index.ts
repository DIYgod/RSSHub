import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/air/:area',
    radar: [
        {
            source: ['m.air-level.com/air/:area/', 'www.air-level.com/air/:area/'],
            target: '/air/:area',
        },
    ],
    parameters: {
        area: '地区',
    },
    name: '空气质量',
    maintainers: ['lifetraveler'],
    example: '/air-level/air/xian',
    handler,
};

async function handler(ctx) {
    const area = ctx.req.param('area');
    const currentUrl = `https://www.air-level.com/air/${area}/`;
    const response = await ofetch(currentUrl);
    const $ = load(response);

    const title = $('main h1').text();
    const summary = $('main .card-body.text-center').first();
    const table = $('main table').first();
    const quality = summary.find('[class*="aqi-level-"]').text().trim();
    const pubTime = summary.text().match(/发布时间：\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1];

    if (!title || !pubTime || !table.find('tbody tr').length) {
        throw new Error('Unable to find current air quality data on the source page.');
    }

    const items = [
        {
            title: `${title} ${quality} ${pubTime}`,
            link: currentUrl,
            description: `<table border="1 solid black">${table.html()}</table>`,
            guid: pubTime,
            pubDate: timezone(parseDate(pubTime, 'YYYY-MM-DD HH:mm:ss'), 8),
        },
    ];
    return {
        title,
        item: items,
        description: '订阅每个城市的天气质量',
        link: currentUrl,
    };
}
