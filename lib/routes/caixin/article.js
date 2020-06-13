const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://mapiv5.caixin.com//m/api/getWapIndexListByPage?page=1&callback=&_=1560140003179',
        headers: {
            Referer: `http://mapiv5.caixin.com/`,
            Host: 'mapiv5.caixin.com',
        },
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
