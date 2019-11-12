const got = require('@/utils/got');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const feature = ctx.params.feature || 0;
    const token = await ctx.cache.get('weibotimelineuid' + uid, false);

    if (token) {
        const response = await got.get(`https://api.weibo.com/2/statuses/home_timeline.json?access_token=${token}&count=100&feature=${feature}`);
        const data = response.data.statuses;

        const links = await Promise.all(
            data.map(async (item) => {
                const url = await ctx.cache.tryGet('weibotimelineurl' + item.user.id + item.id, async () => {
                    let result = 'https://weibo.com';
                    try {
                        await got.get(`http://api.weibo.com/2/statuses/go?access_token=${token}&id=${item.id}&uid=${item.user.id}`, {
                            hooks: {
                                beforeRedirect: [
                                    (options) => {
                                        options.followRedirect = false;
                                        result = options.href;
                                    },
                                ],
                            },
                        });
                    } catch (error) {
                        // nothing
                    }

                    return result;
                });
                return Promise.resolve(url);
            })
        );

        ctx.state.data = {
            title: '个人微博时间线',
            link: 'https://weibo.com',
            item: data.map((item, index) => {
                let description = item.text;
                item.pic_urls.forEach((pic) => {
                    description += `<img src="${pic.thumbnail_pic}"><br>`;
                });
                description += item.source;
                return {
                    description,
                    link: links[index],
                    pubDate: item.created_at,
                    title: `${item.user.name}: ${item.text}`,
                    author: item.user.name,
                };
            }),
        };
    } else if (uid === '0' || ctx.querystring) {
        const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0', app_secret = '' } = config.weibo;

        const code = Object.values(ctx.query)[0];
        if (code) {
            const rep = await got.post(`https://api.weibo.com/oauth2/access_token?client_id=${app_key}&client_secret=${app_secret}&code=${code}&redirect_uri=${redirect_url}&grant_type=authorization_code`);
            const token = rep.data.access_token;
            const uid = rep.data.uid;
            const expires_in = rep.data.expires_in;
            await ctx.cache.set('weibotimelineuid' + uid, token, expires_in, false);

            ctx.set({
                'Content-Type': 'text/html; charset=UTF-8',
                'Cache-Control': 'no-cache',
            });
            ctx.body = `<script>window.location = '/weibo/timeline/${uid}'</script>`;
        }
    } else {
        const { app_key = '', redirect_url = ctx.request.origin + '/weibo/timeline/0' } = config.weibo;

        ctx.status = 302;
        ctx.set({
            'Cache-Control': 'no-cache',
        });
        ctx.redirect(`https://api.weibo.com/oauth2/authorize?client_id=${app_key}&redirect_uri=${redirect_url}`);
    }
};
