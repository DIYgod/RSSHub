const axios = require('../../utils/axios');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'http://www.laosiji.com/thread/hotList',
    });

    const data = response.data;

    ctx.state.data = {
        title: '老司机-24小时热门',
        link: 'http://www.laosiji.com/new_web/index.html',
        description: '老司机-24小时热门',
        item: data.map(({ title, id, imageInfo, createtime }) => ({
            title,
            link: `http://www.laosiji.com/thread/${id}.html`,
            description: `<img referrerpolicy="no-referrer" src="${imageInfo.url}">`,
            pubDate: new Date(createtime).toUTCString(),
        })),
    };
};
