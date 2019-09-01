const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        baseUrl: 'https://cn.bing.com',
        url: '/HPImageArchive.aspx',
        params: {
            format: 'js',
            idx: 0,
            n: 7,
            mkt: 'zh-CN',
        },
    });
    const data = response.data;
    ctx.state.data = {
        title: 'Bing每日壁纸',
        link: `https://cn.bing.com/`,
        item: data.images.map((item) => ({
            title: item.copyright,
            description: `<img src="https://cn.bing.com${item.url}">`,
            link: item.copyrightlink,
        })),
    };
};
