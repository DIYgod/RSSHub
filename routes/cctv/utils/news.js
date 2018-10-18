const axios = require('../../../utils/axios');

module.exports = async (category) => {
    const url = `http://news.cctv.com/${category}/data/index.json`;

    const response = await axios({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;
    const list = data.rollData;

    return {
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
