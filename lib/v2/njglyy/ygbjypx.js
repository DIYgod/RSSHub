const { getNoticeList } = require('./utils');

const url = 'https://njglyy.com/ygb/jypx/jypx.aspx';
const host = 'https://njglyy.com/ygb/jypx/';

module.exports = async (ctx) => {
    const out = await getNoticeList(ctx, url, host, '.mtbd-list > dl', 'a', 'dt', {
        title: '.detail',
        content: '.detail2',
        date: 'span:contains("发布时间")',
    });

    ctx.state.data = {
        title: '南京鼓楼医院 -- 员工版教育培训',
        link: url,
        item: out,
    };
};
