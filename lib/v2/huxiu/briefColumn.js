const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, briefApi, ProcessFeed } = require('./utils');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${briefApi}/briefColumn/getContentListByCategoryId`;
    const { data: response } = await got
        .post(link, {
            form: {
                platform: 'www',
                brief_column_id: id,
            },
        })
        .json();
    const {
        data: { data: briefDetail },
    } = await got.post(`${briefApi}/briefColumn/detail`, {
        form: {
            platform: 'www',
            brief_column_id: id,
        },
    });

    const list = response.datalist.map((item) => ({
        title: item.title,
        link: `${baseUrl}/brief/${item.brief_id}`,
        description: item.preface,
        pubDate: parseDate(item.publish_time, 'X'),
    }));

    const items = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `虎嗅 - ${briefDetail.name}`,
        description: briefDetail.summary,
        image: briefDetail.head_img,
        link: `${baseUrl}/briefColumn/${id}.html`,
        item: items,
    };
};
