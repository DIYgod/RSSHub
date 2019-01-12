const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const cid = ctx.params.cid;
    const url = `http://api.1sapp.com/content/outList?cid=${cid}&tn=1&page=1&limit=10`;
    const response = await axios.get(url);
    const result = response.data.data.data;

    ctx.state.data = {
        title: '趣头条',
        link: 'http://home.qutoutiao.net',
        description: '趣头条',
        item: result.map((item) => ({
            title: item.title,
            description: `${item.introduction}<br><img referrerpolicy="no-referrer" src="${item.cover[0]}">`,
            pubDate: new Date(item.show_time * 1000).toGMTString(),
            link: item.url,
        })),
    };
};
