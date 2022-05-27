const got = require('@/utils/got');

module.exports = async (ctx) => {
    const link = `https://wallpaperhub.app/api/v1/wallpapers/?limit=20&page=&query=&width=&height=&tags=`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const list = response.data.entities.slice(0, 20).map((item) => ({
        title: item.entity.title,
        description: `<p>${item.entity.description}</p><img src="${item.entity.thumbnail}">`,
        pubDate: new Date(item.entity.created).toUTCString(),
        link: `https://wallpaperhub.app/wallpapers/${item.entity.id}`,
    }));

    ctx.state.data = {
        title: `Wallpaperhub`,
        link: 'https://wallpaperhub.app/wallpapers',
        item: list,
    };
};
