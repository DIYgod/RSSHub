const got = require('@/utils/got');
const dayjs = require('dayjs');

module.exports = async (ctx) => {
    const beforeDays = ctx.params.before ? parseInt(ctx.params.before) : 30;
    const afterDays = ctx.params.after ? parseInt(ctx.params.after) : 30;
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

    ctx.state.data = {
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
};
