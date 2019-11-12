const got = require('@/utils/got');
const cache = require('./cache');

module.exports = async (ctx) => {
    const uid = ctx.params.uid;
    const name = await cache.getUsernameFromUID(ctx, uid);

    const response = await got({
        method: 'get',
        url: `https://api.bilibili.com/x/space/article?mid=${uid}&pn=1&ps=10&sort=publish_time&jsonp=jsonp`,
        headers: {
            Referer: `https://space.bilibili.com/${uid}/`,
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `${name} 的 bilibili 专栏`,
        link: `https://space.bilibili.com/${uid}/#/article`,
        description: `${name} 的 bilibili 专栏`,
        item:
            data.articles &&
            data.articles.map((item) => ({
                title: item.title,
                description: `${item.summary}<br><img src="${item.image_urls[0]}">`,
                pubDate: new Date(item.publish_time * 1000).toUTCString(),
                link: `https://www.bilibili.com/read/cv${item.id}`,
            })),
    };
};
