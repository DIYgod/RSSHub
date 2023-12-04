const utils = require('./utils');
const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const list_url = `https://m.thepaper.cn/list/${id}`;
    const list_url_resp = await got(list_url);
    const list_url_data = JSON.parse(cheerio.load(list_url_resp.data)('#__NEXT_DATA__').html());

    const resp = await got.post('https://api.thepaper.cn/contentapi/nodeCont/getByNodeIdPortal', {
        json: {
            nodeId: id,
        },
    });
    const pagePropsData = resp.data.data;
    const list = pagePropsData.list;

    const items = await Promise.all(list.map((item) => utils.ProcessItem(item, ctx)));
    ctx.state.data = {
        title: `澎湃新闻栏目 - ${utils.ListIdToName(id, list_url_data)}`,
        link: list_url,
        item: items,
        itunes_author: '澎湃新闻',
        image: pagePropsData.nodeInfo?.pic ?? utils.ExtractLogo(list_url_resp),
    };
};
