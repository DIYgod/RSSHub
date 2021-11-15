import got from '~/utils/got.js';

export default async (ctx) => {
    const {
        id
    } = ctx.params;
    const url = `http://www.jijitang.com/article/list?sort=${id}`;
    const {
        data
    } = await got.get(url);

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
