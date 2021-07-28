const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const paramId = parseInt(ctx.params.id);
    const apiUrl = 'https://www.infoq.cn/public/v1/article/getList';
    const infoUrl = 'https://www.infoq.cn/public/v1/topic/getInfo';
    const pageUrl = `https://www.infoq.cn/topic/${paramId}`;

    const info = await got({
        method: 'post',
        url: infoUrl,
        headers: {
            Referer: pageUrl,
        },
        json: {
            id: paramId,
        },
    });
    const topicName = info.data.data.name;
    const type = info.data.data.type;

    const resp = await got({
        method: 'post',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
        },
        json: {
            size: 5,
            type: type,
            id: paramId,
        },
    });

    const data = resp.data.data;
    const items = await utils.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: `InfoQ话题 - ${topicName}`,
        link: pageUrl,
        description: `InfoQ话题 - ${topicName}`,
        item: items,
    };
};
