const got = require('@/utils/got');
const { processList, processItems } = require('./utils');

const host = 'https://www.liulinblog.com';

const titleMap = {
    internet: '互联网早报',
    seo: '站长圈',
};

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 'internet';
    const url = `${host}/itnews/${channel}`;
    const response = await got(url);
    const list = processList(response);
    const items = await processItems(list, ctx);

    ctx.state.data = {
        title: titleMap[channel],
        link: url,
        item: items,
    };
};
