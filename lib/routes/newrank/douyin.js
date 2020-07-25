const got = require('@/utils/got');
const config = require('@/config').value;
const utils = require('./utils');

module.exports = async (ctx) => {
    const dyid = ctx.params.dyid;
    const username = config.newrank.username;
    const password = utils.decrypt_password(config.newrank.password);
    const nonce = utils.random_nonce(9);
    const xyz = utils.decrypt_xyz(username, password, nonce);
    const douyin_account = 'newrank_douyin_token_' + dyid;
    let douyin_account_token = await ctx.cache.get(douyin_account);
    if (!douyin_account_token) {
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
        douyin_account_token = nameResponse.data.value.token;
        ctx.cache.set(douyin_account, douyin_account_token);
    }
    const url_detail = 'https://xd.newrank.cn/xdnphb/nr/cloud/douyin/detail/aweme?xyz=' + utils.decrypt_douyin_detail_xyz(nonce) + '&nonce=' + nonce;
    const response_detail = await got({
        method: 'post',
        url: url_detail,
        headers: {
            Connection: 'keep-alive',
            'Content-Type': 'application/json',
            Cookie: 'token=' + douyin_account_token,
        },
        data: JSON.stringify({
            create_time_end: '',
            create_time_start: '',
            date_type: '',
            is_promotion: '0',
            is_seed: '0',
            keyword: '',
            size: 20,
            sort: 'create_time',
            start: 1,
            uid: dyid,
        }),
    });
    const url_account = 'https://xd.newrank.cn/xdnphb/nr/cloud/douyin/detail/accountInfoAll?nonce=' + nonce + '&xyz=' + utils.decrypt_douyin_account_xyz(nonce);
    const response_account = await got({
        method: 'post',
        url: url_account,
        headers: {
            Connection: 'keep-alive',
            Cookie: 'token=' + douyin_account_token,
        },
        data: JSON.stringify({
            uid: dyid,
        }),
    });
    const name = response_account.data.data.nickname;
    const description = response_account.data.data.signature;
    const articles = utils.flatten(response_detail.data.data.list);
    const items = await Promise.all(
        articles.map(async (item) => ({
            title: item.aweme_desc,
            description: '',
            link: item.share_url,
            pubDate: item.create_time,
        }))
    );

    ctx.state.data = {
        title: name + ' - 抖音',
        description: description,
        link: 'https://xd.newrank.cn/data/d/account/workList/' + dyid,
        item: items,
    };
};
