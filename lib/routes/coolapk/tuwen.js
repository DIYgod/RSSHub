const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type || 'hot';
    let full_url, feedTitle;
    if (ctx.originalUrl.startsWith(`/coolapk/tuwen-xinxian`) || type === 'latest') {
        // 实时
        full_url =
            utils.base_url +
            '/v6/page/dataList?url=%2Ffeed%2FdigestList%3FcacheExpires%3D300%26type%3D12%26message_status%3Dall%26is_html_article%3D1%26filterEmptyPicture%3D1%26filterTag%3D%E4%BA%8C%E6%89%8B%E4%BA%A4%E6%98%93%252C%E9%85%B7%E5%AE%89%E8%87%AA%E8%B4%B8%E5%8C%BA%252C%E8%96%85%E7%BE%8A%E6%AF%9B%E5%B0%8F%E5%88%86%E9%98%9F%26title%3D%E6%96%B0%E9%B2%9C%E5%9B%BE%E6%96%87&title=%E6%96%B0%E9%B2%9C%E5%9B%BE%E6%96%87&subTitle=&page=1';
        feedTitle = `酷安 - 新鲜图文`;
    } else if (ctx.originalUrl.startsWith(`/coolapk/tuwen`)) {
        // 精选
        full_url = utils.base_url + '/v6/page/dataList?url=%23%2Ffeed%2FdigestList%3Ftype%3D12%26is_html_article%3D1%26recommend%3D3&title=%E5%9B%BE%E6%96%87&page=1';
        feedTitle = `酷安图文 - 编辑精选`;
    }
    const response = await got({
        method: 'get',
        url: full_url,
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    const out = await Promise.all(data.map(async (item) => utils.parseDynamic(item, ctx)));

    ctx.state.data = {
        title: `${feedTitle}`,
        link: 'https://www.coolapk.com/',
        description: `${feedTitle}`,
        item: out,
    };
};
