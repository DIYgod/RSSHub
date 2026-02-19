import dayjs from 'dayjs';

import type { Route } from '@/types';
import got from '@/utils/got';

export const route: Route = {
    path: '/calendar/:before?/:after?',
    categories: ['anime'],
    example: '/thwiki/calendar',
    parameters: { before: 'From how many days ago (default 30)', after: 'To how many days after (default 30)' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['thwiki.cc/', 'thwiki.cc/日程表'],
            target: '/calendar',
        },
    ],
    name: 'Calendar',
    maintainers: ['aether17'],
    handler,
    url: 'thwiki.cc/',
};

async function handler(ctx) {
    const beforeDays = ctx.req.param('before') ? Number.parseInt(ctx.req.param('before')) : 30;
    const afterDays = ctx.req.param('after') ? Number.parseInt(ctx.req.param('after')) : 30;
    const before = dayjs().subtract(beforeDays, 'day').format('YYYY-MM-DD');
    const after = dayjs().add(afterDays, 'day').format('YYYY-MM-DD');

    const response = await got({
        method: 'get',
        url: `https://calendar-serverless.thwiki.cc/api/events/${before}/${after}`,
        headers: {
            Origin: 'https://thwiki.cc',
        },
    });
    const data = response.data.results;

    return {
        title: 'Touhou events calendar (THBWiki)',
        link: `https://calendar.thwiki.cc/`,
        description: 'A Touhou related events calendar api from THBWiki',
        item: data.map((item) => ({
            title: item.title,
            author: item.title,
            category: item.type ? item.type[0] : '活动',
            description: `${item.desc}. 开始时间: ${item.startStr}. 结束时间: ${item.endStr}.${item.type ? ' 活动类型: ' + item.type[0] : ''}`,
            guid: item.id,
            link: item.url,
        })),
    };
}
