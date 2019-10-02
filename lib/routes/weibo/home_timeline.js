const got = require('@/utils/got');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const feature = ctx.params.feature || 0;
    const token = ctx.cache.get(uid);

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
    } else {
        ctx.response.redirect(`/oauth/weibo`);
    }
};
