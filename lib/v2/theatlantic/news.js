const got = require('@/utils/got');
const cheerio = require('cheerio');
const { asyncPoolAll, parseArticle } = require('./utils');
module.exports = async (ctx) => {
    const host = 'https://www.theatlantic.com';
    const category = ctx.params.category;
    const url = `${host}/${category}`;
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const contents = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.urqlState;
    const firstKey = Object.keys(contents)[0];
    const data = JSON.parse(contents[firstKey].data);
    const list = Object.values(data)[0].river.edges.map((item) => {
        const data = {};
        data.title = item.node.title;
        data.link = item.node.url;
        data.pubDate = item.node.datePublished;
        return data;
    });
    const items = await asyncPoolAll(1, list, (item) => parseArticle(item, ctx));

    ctx.state.data = {
        title: `The Atlantic - ${category.toUpperCase()}`,
        link: url,
        description: `The Atlantic - ${category.toUpperCase()}`,
        item: items,
    };
};
