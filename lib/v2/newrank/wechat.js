const got = require('@/utils/got');
const { finishArticleItem } = require('@/utils/wechat-mp');
const cheerio = require('cheerio');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    if (!config.newrank || !config.newrank.cookie) {
        throw Error('newrank RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }
    const uid = ctx.params.wxid;
    const nonce = utils.random_nonce(9);
    const { data: summaryHTML } = await got({
        method: 'get',
        url: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        headers: {
            Connection: 'keep-alive',
            Cookie: config.newrank.cookie,
        },
    });
    const summary$ = cheerio.load(summaryHTML);
    const mainsrc = summary$('script')
        .toArray()
        .find((item) => (item.attribs.src || '').startsWith('/new/static/js/main.')).attribs.src;
    const { data: mainScript } = await got({
        method: 'get',
        url: `https://www.newrank.cn${mainsrc}`,
    });
    const N_TOKEN_match = mainScript.match(/"N-Token":"([^"]+)/);
    if (!N_TOKEN_match) {
        throw Error('Cannot find n-token');
    }
    const N_TOKEN = N_TOKEN_match[1];
    const response = await got({
        method: 'post',
        url: 'https://gw.newrank.cn/api/wechat/xdnphb/detail/v1/rank/article/lists',
        headers: {
            Connection: 'keep-alive',
            Cookie: config.newrank.cookie,
            'n-token': N_TOKEN,
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
    await Promise.all(items.map((item) => finishArticleItem(ctx, item)));

    ctx.state.data = {
        title: name + ' - 微信公众号',
        link: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        item: items,
    };
};
