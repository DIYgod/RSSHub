const got = require('@/utils/got');
const config = require('@/config').value;
const art = require('art-template');
const path = require('path');

module.exports = async (ctx) => {
    ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-cache',
    });

    const website = ctx.params.website;
    const { app_id = '', redirect_url = '', oauth_url = '', app_secret = '' } = config[website];

    // 进入授权页
    if (website) {
        ctx.body = art(path.resolve(__dirname, '../views/oauth.art'), {
            website,
            get_code_url: `${oauth_url}authorize?client_id=${app_id}&redirect_uri=${redirect_url}`,
        });
    }

    // 请求token，回调时使用
    if (ctx.querystring) {
        const code = Object.values(ctx.query)[0];
        const rep = await got.post(`${oauth_url}access_token?client_id=${app_id}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
        const token = rep.data.access_token;
        ctx.body = art(path.resolve(__dirname, '../views/oauth.art'), {
            token: token,
        });
    }
};
