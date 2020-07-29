const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const id = ctx.params.id || 1;
    const response = await got.get(`https://api.dongqiudi.com/app/tabs/iphone/${id}.json?mark=gif&version=576`);
    const data = response.data.articles;
    const label = response.data.label;

    const proList = [];

    const out = await Promise.all(
        data.map(async (item) => {
            const title = item.title;
            const itemUrl = item.share;

            const cache = await ctx.cache.get(itemUrl);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const single = {
                title,
                link: itemUrl,
            };

            const es = got.get(itemUrl);
            proList.push(es);
            return Promise.resolve(single);
        })
    );

    const responses = await got.all(proList);
    for (let i = 0; i < proList.length; i++) {
        utils.ProcessFeedType2(out[i], responses[i].data);
    }
    ctx.state.data = {
        title: `懂球帝 - ${label}`,
        link: 'http://dongqiudi.com/news',
        item: out.filter((e) => e !== undefined),
    };
};
