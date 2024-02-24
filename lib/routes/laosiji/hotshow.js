const got = require('@/utils/got');
const { parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `http://www.laosiji.com/hotshow/detail/${id}`;
    const response = await got({
        method: 'post',
        url: 'http://www.laosiji.com/api/hotShow/program',
        headers: {
            Referer: link,
        },
        form: {
            hotShowId: id,
            sort: 1,
            pageNo: 1,
        },
    });

    const data = response.data.body.hotshow;

    ctx.state.data = {
        title: `老司机-${data.name}`,
        link,
        item: data.sns.list.map(({ title, resourceid, image, publishtime }) => ({
            title,
            link: `http://www.laosiji.com/thread/${resourceid}.html`,
            description: `<img src="${image.url}">`,
            pubDate: timezone(parseRelativeDate(publishtime), 8),
        })),
    };
};
