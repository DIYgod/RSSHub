import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/rank/:status?',
    radar: [
        {
            source: ['m.air-level.com/rank/:status', 'm.air-level.com/rank', 'www.air-level.com/rank/:status', 'www.air-level.com/rank'],
            target: '/rank/:status?',
        },
    ],
    parameters: {
        status: '地区',
    },
    name: '空气质量排行',
    maintainers: ['lifetraveler'],
    example: '/air-level/rank/best,/air-level/rank',
    handler,
};

async function handler(ctx) {
    const status = ctx.req.param('status');
    const currentUrl = 'https://www.air-level.com/rank/';
    const response = await ofetch(currentUrl);
    const $ = load(response);
    let table = '';
    let title = '';

    const cards = $('main .card').filter((_, element) => $(element).find('table').length > 0);
    const best = cards.filter((_, element) => $(element).find('.card-header').text().includes('最佳'));
    const worst = cards.filter((_, element) => $(element).find('.card-header').text().includes('最差'));
    const titleBest = best.find('.card-header').text().trim();
    const titleWorst = worst.find('.card-header').text().trim();
    const pubTime = $('main p')
        .first()
        .text()
        .match(/数据更新时间：\s*(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})/)?.[1];

    if (!pubTime || !best.find('tbody tr').length || !worst.find('tbody tr').length) {
        throw new Error('Unable to find current air quality rankings on the source page.');
    }

    if (status === 'best') {
        title = titleBest;
        table = best.find('table').prop('outerHTML')!;
    } else if (status === 'worsest') {
        title = titleWorst;
        table = worst.find('table').prop('outerHTML')!;
    } else if (status) {
        throw new Error('Invalid ranking status. Use best or worsest, or omit the status for both rankings.');
    } else {
        title = $('main h1').text();
        table = `<h3>${titleBest}</h3>${best.find('table').prop('outerHTML')}<h3>${titleWorst}</h3>${worst.find('table').prop('outerHTML')}`;
    }

    const items = [
        {
            title,
            link: currentUrl,
            description: table,
            guid: pubTime,
            pubDate: timezone(parseDate(pubTime, 'YYYY-MM-DD HH:mm:ss'), 8),
        },
    ];
    return {
        title,
        item: items,
        description: '空气质量排行',
        link: currentUrl,
    };
}
