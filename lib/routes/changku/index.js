const got = require('@/utils/got');
module.exports = async (ctx) => {
    const url = `https://app.vmovier.com/apiv3/index/getIndexPosts/lastid/`;
    const config = {
        headers: {
            'user-agent': 'VmovierApp 5.7.7 / Android 10 / WIFI / 1080*2175 / 2.75',
            'content-type': 'application/x-www-form-urlencoded',
        },
    };
    const res = await got({
        method: 'get',
        url: url,
    });
    const items = await Promise.all(
        res.data.data.list.map(async (list) => {
            const title = list.title;
            const link = `https://app.vmovier.com/apiv3/post/view?postid=${list.postid}`;
            const description = await ctx.cache.tryGet(link, async () => {
                const res = await got.get(link, config);
                const playurl = res.data.data.content_video[0].progressive[0].url;
                const desc = `<meta name="referrer" content="no-referrer"><video src='${playurl}' controls='controls' width='100%'></video><p>${res.data.data.intro}</p><img src='${res.data.data.image}' width='200'>`;
                return desc;
            });
            return Promise.resolve({
                title: title,
                description: description,
                author: list.creator_username,
                link: link,
            });
        })
    );
    ctx.state.data = {
        title: `场库-每日精选`,
        link: url,
        description: '场库-每日精选',
        item: items,
    };
};
