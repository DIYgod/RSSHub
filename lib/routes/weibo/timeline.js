const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const feature = ctx.params.feature || 0;
    const token = ctx.cache.get('weibotimeline' + uid);

    if (token) {
        const response = await got.get(`https://api.weibo.com/2/statuses/home_timeline.json?access_token=${token}&count=100&feature=${feature}`);
        const data = response.data.statuses;

        const rssData = (item) => {
            let description = item.text;
            item.pic_urls.forEach((pic) => {
                description += `<img src="${pic.thumbnail_pic}"><br>`;
            });
            description += item.source;
            return {
                description,
                link: `http://api.weibo.com/2/statuses/go?access_token=${token}&id=${item.id}&uid=${item.user.id}`,
                pubDate: item.created_at,
                title: `${item.user.name}-${item.text.slice(15)}`,
            };
        };

        ctx.state.data = {
            title: '个人微博时间线',
            link: 'https://weibo.com',
            item: data.map(rssData),
        };
    } else if (uid === '0' || ctx.querystring) {
        const { app_id = '', redirect_url = '', app_secret = '' } = config.weibo;

        const code = Object.values(ctx.query)[0];
        if (code) {
            const rep = await got.post(`https://api.weibo.com/oauth2/access_token?client_id=${app_id}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
            const token = rep.data.access_token;
            const uid = rep.data.uid;
            const expires_in = rep.data.expires_in;
            await ctx.cache.set('weibotimeline' + uid, token, expires_in);

            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
            });
            ctx.body = `<script>window.location = '/weibo/timeline/${uid}'</script>`;
        }
    } else {
        const website = 'weibo';
        const { app_id = '', redirect_url = '' } = config[website];

        ctx.status = 302;
        ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${app_id}&redirect_uri=${redirect_url}`);
    }
};
