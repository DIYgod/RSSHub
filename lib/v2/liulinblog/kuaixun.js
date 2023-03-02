const got = require('@/utils/got');
const { processList, processItems } = require('./utils');

const host = 'https://www.liulinblog.com';

module.exports = async (ctx) => {
    const url = `${host}/kuaixun`;
    const response = await got(url);
    const list = processList(response);
    const items = await processItems(list, ctx);

    ctx.state.data = {
        title: '每天六十秒（60秒）读懂世界',
        link: url,
        item: items,
    };
};
