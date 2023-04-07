const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.wxid;
    const nonce = utils.random_nonce(9);
    const { data: summaryHTML } = await got({
        method: 'get',
        url: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        headers: {
            Connection: 'keep-alive',
            Cookie: String(config.newrank.cookie),
        },
    });
    let mainsrc = '';
    const summary$ = cheerio.load(summaryHTML);
    summary$('script')
        .toArray()
        .forEach((item) => {
            const src = item.attribs.src || '';
            if (src.startsWith('/new/static/js/main.')) {
                mainsrc = src;
            }
        });
    const { data: mainScript } = await got({
        method: 'get',
        url: `https://www.newrank.cn${mainsrc}`,
    });
    const index_start = mainScript.indexOf('"N-Token":"') + '"N-Token":"'.length;
    const index_end = mainScript.indexOf('"', index_start);
    const N_TOKEN = mainScript.substring(index_start, index_end);

    const response = await got({
        method: 'post',
        url: 'https://gw.newrank.cn/api/wechat/xdnphb/detail/v1/rank/article/lists',
        headers: {
            Connection: 'keep-alive',
            Cookie: String(config.newrank.cookie),
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

    ctx.state.data = {
        title: name + ' - 微信公众号',
        link: `https://www.newrank.cn/new/readDetial?account=${uid}`,
        item: items,
    };
};
