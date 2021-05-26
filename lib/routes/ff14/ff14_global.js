const got = require('@/utils/got');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const lang = ctx.params.lang;

    const response = await got({
        method: 'get',
        url: `http://${lang}.lodestonenews.com/news/${type}`,
    });

    let data;
    if (type === 'all') {
        data = [];
        Object.values(response.data).forEach((arr) => (data = data.concat(arr)));
    } else {
        data = response.data;
    }

    ctx.state.data = {
        title: `FFXIV Lodestone updates (${type})`,
        link: `https://${lang}.finalfantasyxiv.com/lodestone/news/`,
        item: data.map(({ id, url, title, time, description, image }) => ({
            title,
            link: url,
            description: `<img src="${image}"><br>${description}<br>`,
            pubDate: time,
            guid: id,
        })),
    };
};
