const axios = require('../../utils/axios');
const qs = require('querystring');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `http://www.laosiji.com/hotshow/detail/${id}`;
    const response = await axios({
        method: 'post',
        url: 'http://www.laosiji.com/api/hotShow/program',
        headers: {
            Referer: link,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            hotShowId: id,
            sort: 1,
            pageNo: 1,
        }),
    });

    const data = response.data.body.hotshow;

    ctx.state.data = {
        title: `老司机-${data.name}`,
        link,
        item: data.sns.list.map(({ title, resourceid, image }) => ({
            title,
            link: `http://www.laosiji.com/thread/${resourceid}.html`,
            description: `<img referrerpolicy="no-referrer" src="${image.url}">`,
        })),
    };
};
