const axios = require('../../utils/axios');
const utils = require('./utils');

module.exports = async (ctx) => {
    const paramId = parseInt(ctx.params.id);
    const apiUrl = 'https://www.infoq.cn/public/v1/article/getList';
    const infoUrl = 'https://www.infoq.cn/public/v1/topic/getInfo';
    const pageUrl = `https://www.infoq.cn/topic/${paramId}`;

    const info = await axios({
        method: 'post',
        url: infoUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
        data: {
            id: paramId,
        },
    });
    const topicName = info.data.data.name;
    const type = info.data.data.type;

    const resp = await axios({
        method: 'post',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
        data: {
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
