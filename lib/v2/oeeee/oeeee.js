const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { parseArticle } = require('./utils');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const channel = ctx.params.channel ?? 0;
    const currentUrl = `https://www.oeeee.com/api/channel.php?m=Js4channelNews&a=newLatest&cid=${channel}`;

    const { data: response } = await got(currentUrl);

    const list = response.data.map((item) => ({
        title: '【' + item.channel_name + '】' + item.title,
        description: art(path.join(__dirname, 'templates/description.art'), {
            thumb: item.img,
            description: item.summary,
        }),
        pubDate: timezone(parseDate(item.datetime), +8),
        link: item.linkurl,
        author: item.author,
        // channelName: item.channel_name,
        channelEname: item.channel_ename,
    }));

    const channelEname = list[1] ? list[1].channelEname : '';

    const items = await Promise.all(list.map((item) => parseArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `南方都市报奥一网`,
        link: `https://www.oeeee.com/api/channel.php?s=/index/index/channel/${channelEname}`,
        item: items,
    };
};
