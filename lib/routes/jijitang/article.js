const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const url = `http://www.jijitang.com/article/list?sort=${id}`;
    const res = await got.get(url);
    const data = res.data;

    ctx.state.data = {
        title: `唧唧堂  ${id}`,
        link: url,
        item: data.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: item.createTime,
            link: `http://www.jijitang.com/article/${item._id}`,
        })),
    };
};
