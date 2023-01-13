const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { type = 'recommend' } = ctx.params;
    const response = await got({
        method: 'put',
        url: `https://e.zaozao.run/article/page/${type}`,
        headers: {
            Referer: `https://www.zaozao.run/`,
        },
        body: JSON.stringify({
            pageNo: 1,
            pageSize: 100,
        }),
    });

    const { status, statusMessage } = response;
    if (status !== 200) {
        throw new Error(statusMessage);
    }

    const { data } = response.data;

    ctx.state.data = {
        title: `前端早早聊 - 文章`,
        link: `https://www.zaozao.run/article/${type}`,
        description: `前端早早聊 - 文章`,
        item: data.map((item) => ({
            title: item.title,
            link: item.url,
            author: item.recommenderName,
            pubDate: parseDate(item.updateAt),
        })),
    };
};
