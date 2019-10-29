const got = require('@/utils/got');
const parseDate = require('@/utils/date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'post',
        url: 'https://www.laosiji.com/api/topic/feed/list',
    });

    const data = response.data.body.sns.list;

    ctx.state.data = {
        title: '老司机-首页',
        link: 'http://www.laosiji.com/new_web/index.html',
        description: '老司机-首页',
        item: data.map(({ title, resourceid, image, publishtime }) => ({
            title,
            link: `http://www.laosiji.com/thread/${resourceid}.html`,
            description: `<img src="${image.url}">`,
            pubDate: parseDate(publishtime, 8),
        })),
    };
};
