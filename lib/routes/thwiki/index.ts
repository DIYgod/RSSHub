// @ts-nocheck
import got from '@/utils/got';
const dayjs = require('dayjs');

export default async (ctx) => {
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

    ctx.set('data', {
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
    });
};
