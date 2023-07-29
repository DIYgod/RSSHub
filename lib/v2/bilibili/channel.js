const got = require('@/utils/got');
const utils = require('./utils');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const channel_id = ctx.params.channelid;
    const disableEmbed = ctx.params.disableEmbed;

    const response = await got(`https://www.bilibili.com/v/channel/${channel_id}?tab=multiple`);

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const data = dom.window.__INITIAL_STATE__;

    const channel_name = data.channelDetailBanner.data.name;
    const list = data.flow[`getMultipleByIdx-lastId-channel_id-${channel_id}-sort-hot`].result[0].items;

    ctx.state.data = {
        title: `Bilibili${channel_name}频道排行榜`,
        link: `https://www.bilibili.com/v/channel/${channel_id}?tab=multiple`,
        item: list.map((item) => ({
            title: item.name,
            description: `${item.name}${!disableEmbed ? `<br><br>${utils.iframe(null, null, item.bvid)}` : ''}<br><img src="${item.cover}">`,
            author: item.author,
            link: `https://www.bilibili.com/video/${item.bvid}`,
        })),
    };
};
