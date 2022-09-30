const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const list_url = `https://m.thepaper.cn/list/${id}`;
    const response = await got(list_url);
    const data = JSON.parse(cheerio.load(response.data)('#__NEXT_DATA__').html());
    const pagePropsData = data.props.pageProps.data;
    const list = pagePropsData.list;

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    ctx.state.data = {
        title: `澎湃新闻栏目 - ${utils.ListIdToName(id, data)}`,
        link: list_url,
        item: items,
        itunes_author: '澎湃新闻',
        image: pagePropsData.nodeInfo?.pic ?? utils.ExtractLogo(response),
    };
};
