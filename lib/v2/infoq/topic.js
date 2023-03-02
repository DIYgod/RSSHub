const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const paramId = ctx.params.id;
    const apiUrl = 'https://www.infoq.cn/public/v1/article/getList';
    const infoUrl = 'https://www.infoq.cn/public/v1/topic/getInfo';
    const pageUrl = `https://www.infoq.cn/topic/${paramId}`;

    const infoBody = isNaN(paramId) ? { alias: paramId } : { id: parseInt(paramId) };

    const info = await got.post(infoUrl, {
        headers: {
            Referer: pageUrl,
        },
        json: infoBody,
    });
    const topicName = info.data.data.name;
    const type = info.data.data.type;

    const resp = await got.post(apiUrl, {
        headers: {
            Referer: pageUrl,
        },
        json: {
            size: ctx.query.limit ? Number(ctx.query.limit) : 30,
            type,
            id: info.data.data.id,
        },
    });

    const data = resp.data.data;
    const items = await utils.ProcessFeed(data, ctx.cache);

    ctx.state.data = {
        title: `InfoQ 话题 - ${topicName}`,
        description: info.data.data.desc,
        image: info.data.data.cover,
        link: pageUrl,
        item: items,
    };
};
