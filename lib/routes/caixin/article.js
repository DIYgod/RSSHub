const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://mappsv5.caixin.com/index_page_v5/index_page_1.json',
    });

    const data = response.data.data.list;

    ctx.state.data = {
        title: `财新网 - 首页`,
        link: `http://www.caixin.com/`,
        description: '财新网 - 首页',
        item: data.map((item) => ({
            title: item.title,
            description: `<p>${item.summary}</p><img src="${item.pics}">`,
            link: item.web_url,
            pubDate: new Date(item.time * 1000),
        })),
    };
};
