const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { ProcessFeed } = require('./utils');
const baseUrl = 'https://api-brief.huxiu.com';

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const link = `${baseUrl}/briefColumn/getContentListByCategoryId`;
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
    } = await got.post(`${baseUrl}/briefColumn/detail`, {
        form: {
            platform: 'www',
            brief_column_id: id,
        },
    });

    const list = response.datalist.map((item) => ({
        title: item.title,
        link: `https://www.huxiu.com/brief/${item.brief_id}`,
        description: item.preface,
        pubDate: parseDate(item.publish_time, 'X'),
    }));

    const items = await ProcessFeed(list, ctx.cache);

    ctx.state.data = {
        title: `虎嗅 - ${briefDetail.name}`,
        description: briefDetail.summary,
        image: briefDetail.head_img,
        link: `https://www.huxiu.com/briefColumn/${id}.html`,
        item: items,
    };
};
