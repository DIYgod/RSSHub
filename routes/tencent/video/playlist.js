const axios = require('../../../utils/axios');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://v.qq.com/detail/${id[0]}/${id}.html`;
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);
    const episodeName = $('[itemprop=episodeNumber]')
        .toArray()
        .reverse()
        .slice(0, 20);
    const items = [];
    for (const one of episodeName) {
        const ele = $(one);
        items.push({
            title: ele.text(),
            link: ele.parent().attr('href'),
        });
    }
    ctx.state.data = {
        title: $('title').text(),
        link,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
};
