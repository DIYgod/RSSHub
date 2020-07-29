const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.laosiji.com/thread/hotList',
    });

    const data = response.data;

    ctx.state.data = {
        title: '老司机-24小时热门',
        link: 'http://www.laosiji.com/new_web/index.html',
        description: '老司机-24小时热门',
        item: data.map(({ title, description, id, imageInfo, createtime }) => ({
            title: title === '' ? description : title,
            link: `http://www.laosiji.com/thread/${id}.html`,
            description: `<img src="${imageInfo.url}">${description}`,
            pubDate: new Date(createtime).toUTCString(),
        })),
    };
};
