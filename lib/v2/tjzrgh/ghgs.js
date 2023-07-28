const got = require('@/utils/got');
// const cheerio = require('cheerio');
// const { puppeteerGet } = require('./utils');

module.exports = async (ctx) => {
    // const id = ctx.params.id;
    const area = ctx.params.area || '';
    const type = ctx.params.type || 'ghgs'; // ghgs 62571 //ghgb 62572
    let CHANNELID = 62571;
    if (type === 'ghgb') {
        CHANNELID = 62572;
    }
    const get_url =
        `https://ghhzrzy.tj.gov.cn/igs/front/search/list.html?pageNumber=1&pageSize=18&filter[CHANNELID]=` +
        CHANNELID +
        `&index=tjsghhzrglj&type=xzxkjgcx&orderProperty=ZXSJ&orderDirection=desc&filter[AVAILABLE]=true&filter[BT-like]=` +
        area;

    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: get_url + area,
    });
    const data = response.data; // response.data 为 HTTP GET 请求返回的 HTML
    const list = data.page.content;

    ctx.state.data = {
        title: `天津市规划和自然资源局`,
        link: `https://ghhzrzy.tj.gov.cn/igs/front/search/list.html?pageNumber=1&pageSize=18&filter[CHANNELID]=62572&index=tjsghhzrglj&type=xzxkjgcx&orderProperty=ZXSJ&orderDirection=desc&filter[AVAILABLE]=true&filter[BT-like]=`,
        item:
            list &&
            list.map((item) => {
                const link = item.DOCPUBURL || '';
                return {
                    title: item.BT,
                    description: item.ZW,
                    link,
                };
            }),
    };
};
