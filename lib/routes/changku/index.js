const got = require('@/utils/got');
module.exports = async (ctx) => {
    const url = ctx.params.postid ? `https://app.vmovier.com/apiv3/post/getPostInCate?p=1&size=10&cateid=${ctx.params.postid}` : `https://app.vmovier.com/apiv3/index/getIndexPosts/lastid/`;
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
    const list = res.data.data.list ? res.data.data.list : res.data.data;
    const items = await Promise.all(
        list.map(async (list) => {
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
                link: `https://www.vmovier.com/${list.postid}`,
            });
        })
    );
    ctx.state.data = {
        title: `${ctx.params.postid ? list[0].cate[0].catename : '每日精选'}-场库`,
        link: url,
        description: '场库_高品质短片分享平台',
        item: items,
    };
};
