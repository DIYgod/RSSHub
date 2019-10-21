const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    ctx.set({
        'Content-Type': 'text/html; charset=UTF-8',
    });
    const website = 'weibo';
    const { app_id = '', redirect_url = '', app_secret = '' } = config[website];

    // 请求token，回调时使用
    if (ctx.querystring) {
        const code = Object.values(ctx.query)[0];
        const rep = await got.post(`https://api.weibo.com/oauth2/access_token?client_id=${app_id}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
        const token = rep.data.access_token;
        const uid = rep.data.uid;
        const expires_in = rep.data.expires_in;
        await ctx.cache.set(uid, token, expires_in);

        ctx.body = '<script>window.parent.location = window.parent.location</script>';
    }
};
