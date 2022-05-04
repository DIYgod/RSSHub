const got = require('@/utils/got');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.wxid;
    const nonce = utils.random_nonce(9);
    const response = await got({
        method: 'post',
        url: 'https://www.newrank.cn/xdnphb/detail/v1/rank/article/lists',
        headers: {
            Connection: 'keep-alive',
            Cookie: String(config.newrank.cookie),
        },
        form: {
            account: uid,
            nonce,
            xyz: utils.decrypt_wechat_detail_xyz(uid, nonce),
        },
    });
    const name = response.data.value.user.name;
    const realTimeArticles = utils.flatten(response.data.value.realTimeArticles);
    const articles = utils.flatten(response.data.value.articles);
    const newArticles = realTimeArticles.concat(articles);
    const items = newArticles.map((item) => ({
        title: item.title,
        description: '',
        link: item.url,
        pubDate: item.publicTime,
    }));

    ctx.state.data = {
        title: name + ' - 微信公众号',
        link: 'https://www.newrank.cn/new/readDetial?account=' + uid,
        item: items,
    };
};
