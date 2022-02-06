const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.column;
    const limit = isNaN(parseInt(ctx.query.limit)) ? 25 : parseInt(ctx.query.limit);

    const response = await got({
        method: 'get',
        url: `https://api.cntv.cn/NewVideo/getVideoListByColumn?id=${id}&n=${limit}&sort=desc&p=1&mode=0&serviceId=tvcctv`,
    });
    const data = response.data.data.list;
    const name = data[0].title.match(/《(.*?)》/)[1];

    ctx.state.data = {
        title: `CNTV 栏目 - ${name}`,
        description: `${name} 栏目的视频更新`,
        item: data.map((item) => ({
            title: item.title,
            description: art(path.join(__dirname, 'templates/column.art'), {
                item,
            }),
            pubDate: parseDate(item.time),
            link: item.url,
        })),
    };
};
