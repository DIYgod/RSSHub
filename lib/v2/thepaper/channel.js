const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const channel_url = `https://m.thepaper.cn/channel/${id}`;
    const response = await got(channel_url);
    const data = JSON.parse(cheerio.load(response.data)('#__NEXT_DATA__').html());
    const list = data.props.pageProps.data.list;

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    ctx.state.data = {
        title: `澎湃新闻频道 - ${utils.ChannelIdToName(id, data)}`,
        link: channel_url,
        item: items,
        itunes_author: '澎湃新闻',
        image: 'https://bkimg.cdn.bcebos.com/pic/b3119313b07eca8065387971487280dda144ad342551',
    };
};
