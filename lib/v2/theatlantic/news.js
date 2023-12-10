const got = require('@/utils/got');
const cheerio = require('cheerio');
const { getArticleDetails } = require('./utils');
module.exports = async (ctx) => {
    const host = 'https://www.theatlantic.com';
    const category = ctx.params.category;
    const url = `${host}/${category}/`;
    const response = await got({
        method: 'get',
        url,
    });
    const $ = cheerio.load(response.data);
    const contents = JSON.parse($('script#__NEXT_DATA__').text()).props.pageProps.urqlState;
    const keyWithContent = Object.keys(contents).filter((key) => contents[key].data.includes(category));
    const data = JSON.parse(contents[keyWithContent].data);
    let list = Object.values(data)[0].river.edges;
    list = list.filter((item) => !item.node.url.startsWith('https://www.theatlantic.com/photo'));
    list = list.map((item) => {
        const data = {};
        data.link = item.node.url;
        data.pubDate = item.node.datePublished;
        return data;
    });
    const items = await getArticleDetails(list, ctx);

    ctx.state.data = {
        title: `The Atlantic - ${category.toUpperCase()}`,
        link: url,
        description: `The Atlantic - ${category.toUpperCase()}`,
        item: items,
    };
};
