const utils = require('./utils');

module.exports = async (ctx) => {
    const fanfou = await utils.getFanfou();
    const response = await fanfou.get(`/trends/list`);

    const result = await Promise.all(
        response.trends.map(async (item) => {
            const voItem = {
                title: item.name,
                description: item.name,
                pubDate: new Date(),
                link: item.url,
            };
            return Promise.resolve(voItem);
        })
    );

    ctx.state.data = {
        title: `饭否热门话题`,
        link: `https://fanfou.com/q/`,
        description: `饭否热门话题`,
        item: result,
        allowEmpty: true,
    };
};
