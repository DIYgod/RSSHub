const axios = require('../../utils/axios');
const config = require('../../config');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const url = `http://news.cctv.com/${category}/data/index.json`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': config.ua,
            Referer: url,
        },
    });

    const data = response.data;
    const list = data.rollData;

    ctx.state.data = {
        title: `央视新闻 ${category}`,
        link: `http://news.cctv.com/${category}`,
        description: `央视新闻 ${category}`,
        item: list.map((item) => ({
            title: item.title,
            description: item.description,
            link: item.url,
            pubDate: new Date(item.dateTime).toUTCString(),
        })),
    };
};
