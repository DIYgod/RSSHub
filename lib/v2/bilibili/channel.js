const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const channelId = ctx.params.channelid;
    const disableEmbed = ctx.params.disableEmbed;

    const response = await got(`https://www.bilibili.com/v/channel/${channelId}/?tab=multiple`);

    const $ = cheerio.load(response.data);
    const data = JSON.parse(
        $('script:contains("window.__INITIAL_STATE__")')
            .text()
            .match(/window\.__INITIAL_STATE__=(\{.*?\});/)[1]
    );

    const channel_name = data.channelDetailBanner.data.name;
    const list = data.flow[`getMultipleByIdx-lastId-channel_id-${channelId}-sort-hot`].result[0].items;

    ctx.state.data = {
        title: `Bilibili${channel_name}频道排行榜`,
        link: `https://www.bilibili.com/v/channel/${channelId}?tab=multiple`,
        item: list.map((item) => ({
            title: item.name,
            description: `${item.name}${!disableEmbed ? `<br><br>${utils.iframe(null, null, item.bvid)}` : ''}<br><img src="${item.cover}">`,
            author: item.author_name,
            link: `https://www.bilibili.com/video/${item.bvid}`,
        })),
    };
};
