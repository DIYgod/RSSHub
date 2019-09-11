const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://zhuanlan.qyer.com/api/recommend/article?ajaxID=5adc4860ae8bfd4e7106d4ea&page=1`,
        headers: {
            Referer: `https://zhuanlan.qyer.com/`,
        },
    });
    const data = response.data.data;

    ctx.state.data = {
        title: `穷游网`,
        link: `https://zhuanlan.qyer.com/`,
        description: `穷游网专栏`,
        item: data.map((item) => ({
            title: item.title,
            description: `${item.module}<br><img src="${item.cover_url}">`,
            pubDate: item.ctime_format,
            link: item.web_url,
        })),
    };
};
