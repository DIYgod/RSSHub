const axios = require('@/utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        baseURL: 'https://cn.bing.com',
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
            description: `<img referrerpolicy="no-referrer" src="https://cn.bing.com${item.url}">`,
            link: item.copyrightlink,
        })),
    };
};
