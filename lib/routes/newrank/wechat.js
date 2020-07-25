const got = require('@/utils/got');
const config = require('@/config').value;
const utils = require('./utils');

module.exports = async (ctx) => {
    const wxid = ctx.params.wxid;
    const username = config.newrank.username;
    const password = utils.decrypt_password(config.newrank.password);
    const nonce = utils.random_nonce(9);
    const xyz = utils.decrypt_xyz(username, password, nonce);
    const wechat_account = 'newrank_wechat_token';
    let wechat_account_token = await ctx.cache.get(wechat_account);
    if (!wechat_account_token) {
        const nameResponse = await got({
            method: 'post',
            url: 'https://www.newrank.cn/nr/user/login/loginByAccount',
            form: {
                account: username,
                password: password,
                state: 1,
                nonce: nonce,
                xyz: xyz,
            },
        });
        wechat_account_token = nameResponse.data.value.token;
        ctx.cache.set(wechat_account, wechat_account_token);
    }
    const response = await got({
        method: 'post',
        url: 'https://www.newrank.cn/xdnphb/detail/v1/rank/article/lists',
        headers: {
            Connection: 'keep-alive',
            Cookie: 'token=' + wechat_account_token,
        },
        form: {
            account: wxid,
            nonce: nonce,
            xyz: utils.decrypt_xyz2(wxid, nonce),
        },
    });
    const name = response.data.value.user.name;
    const articles = utils.flatten(response.data.value.articles);
    const items = await Promise.all(
        articles.map(async (item) => ({
            title: item.title,
            description: '',
            link: item.url,
            pubDate: item.publicTime,
        }))
    );

    ctx.state.data = {
        title: name + ' - 微信公众号',
        link: 'https://www.newrank.cn/new/readDetial?account=' + wxid,
        item: items,
    };
};
