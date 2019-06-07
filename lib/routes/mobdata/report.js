const got = require('@/utils/got');
const date = require('@/utils/date');

module.exports = async (ctx) => {
    const apiUrl = 'http://admin.mob.com/api/mobdata/report/list';
    const pageUrl = 'http://mobdata.mob.com/mobdata/report';

    const resp = await got({
        method: 'post',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
    });

    const list = resp.data.list;
    const items = list.map((item) => ({
        title: item.title,
        description: `${item.desc}<br><a href="${item.report_path}">查看报告</a>`,
        pubDate: date(item.created_at),
        link: item.report_path,
    }));
    ctx.state.data = {
        title: 'MobData分析报告',
        link: pageUrl,
        description: 'MobData分析报告',
        item: items,
    };
};
