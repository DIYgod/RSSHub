const got = require('@/utils/got');

module.exports = async (ctx) => {
    const currentUrl = `https://pornhub.com/webmasters/search?category=${ctx.params.caty}`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const list = response.data.videos.map((item) => ({
        title: item.title,
        link: item.url,
        description: `<img src="${item.thumb}">`,
        pubDate: new Date(item.publish_date).toUTCString(),
    }));

    ctx.state.data = {
        title: `Pornhub - ${ctx.params.caty}`,
        link: currentUrl,
        item: list,
    };
};
