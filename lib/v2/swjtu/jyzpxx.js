const utils = require('./utils');
const got = require('@/utils/got');

const rootURL = 'https://jiuye.swjtu.edu.cn/career';

module.exports = async (ctx) => {
    let record = parseInt(ctx.params.record);
    record = isNaN(record) ? 10 : Math.min(Math.max(1, record), 50);
    const resp = await got({
        method: 'post',
        url: `${rootURL}/zpxx/search/zpxx/1/${record}`,
    });

    const list = resp.data.data.list;

    const items = await Promise.all(
        list.map((item) => {
            const key = `${rootURL}/zpxx/data/zpxx/${item.zpxxid}`;
            return utils.descpPage(key, ctx.cache);
        })
    );

    ctx.state.data = {
        title: '西南交大-就业招聘信息',
        link: `${rootURL}/zpxx/zpxx`,
        item: items,
        allowEmpty: true,
    };
};
