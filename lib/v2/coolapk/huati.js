const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    const full_url = utils.base_url + `/v6/page/dataList?url=%23%2Ffeed%2FmultiTagFeedList%3FlistType%3Ddateline_desc%26tag=${tag}&title=%E6%9C%80%E6%96%B0%E5%8F%91%E5%B8%83&subTitle=&page=1`;
    const response = await got(full_url, {
        headers: utils.getHeaders(),
    });
    const data = response.data.data;

    let out = await Promise.all(data.map((item) => utils.parseDynamic(item, ctx)));

    out = out.filter((i) => i); // 去除空值
    if (out.length === 0) {
        throw Error('这个话题还没有被创建或现在没有图文及动态内容。');
    }
    ctx.state.data = {
        title: `酷安话题-${tag}`,
        link: `https://www.coolapk.com/`,
        description: `酷安话题-${tag}`,
        item: out,
    };
};
