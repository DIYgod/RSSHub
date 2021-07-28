const got = require('@/utils/got');

module.exports = async (ctx) => {
    const currentUrl = `https://pornhub.com/webmasters/search?search=${ctx.params.keyword}`;
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
        title: `Pornhub - ${ctx.params.keyword}`,
        link: currentUrl,
        item: list,
    };
};
