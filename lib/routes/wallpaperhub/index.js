const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://wallpaperhub-fn.azurewebsites.net/api/wallpapers`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.wallpapers.slice(0, 20).map((item) => ({
        title: item.title,
        description: `<p>${item.description}</p><img src="${item.thumbnail}">`,
        pubDate: new Date(item.publishedDate).toUTCString(),
        link: `https://wallpaperhub.app/wallpapers/${item.id}`,
    }));

    ctx.state.data = {
        title: `Wallpaperhub`,
        link: 'https://wallpaperhub.app/wallpapers',
        item: list,
    };
};
