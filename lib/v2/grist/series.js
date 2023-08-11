const { getData, getList } = require('./utils');

module.exports = async (ctx) => {
    const baseUrl = 'https://grist.org';
    const searchRoute = '/wp-json/wp/v2/series?slug=';
    const articleRoute = '/wp-json/wp/v2/posts?series=';
    const { series } = ctx.params;
    const id = (await getData(`${baseUrl}${searchRoute}${series}`))[0].id;
    const data = await getData(`${baseUrl}${articleRoute}${id}&_embed`);
    const items = await getList(data);

    ctx.state.data = {
        title: `${series[0].toUpperCase() + series.slice(1)} - Gist Articles`,
        link: `${baseUrl}/${series}`,
        item: items,
        description: `${series[0].toUpperCase() + series.slice(1)} Articles on grist.org`,
        logo: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=192',
        icon: 'https://grist.org/wp-content/uploads/2021/03/cropped-Grist-Favicon.png?w=32',
        language: 'en-us',
    };
};
