const got = require('@/utils/got');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://sspai.com/series',
    });

    const dom = new JSDOM(response.data, {
        runScripts: 'dangerously',
    });

    const data = dom.window.__INITIAL_STATE__.seriesHomeModule.seriesSearchpage;

    ctx.state.data = {
        title: '少数派 -- 最新上架付费专栏',
        link: 'https://sspai.com/series',
        description: '少数派 -- 最新上架付费专栏',
        item: data.map((item) => ({
            title: item.title,
            description: `<img src="https://cdn.sspai.com/${item.banner}"><br>${item.description}`,
            link: `https://sspai.com/series/${item.id}`,
            author: item.author.nickname,
            pubDate: new Date(item.released_at * 1000),
        })),
    };
};
