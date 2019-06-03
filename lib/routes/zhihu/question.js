const got = require('@/utils/got');
const utils = require('./utils');

module.exports = async (ctx) => {
    const { questionId } = ctx.params;
    const sort = 'created';
    const limit = 20;
    const include = `data[*].content.excerpt&limit=${limit}&offset=0`;
    const url = `https://www.zhihu.com/api/v4/questions/${questionId}/answers?include=${include}&sort_by=${sort}`;
    const response = await got({
        method: 'get',
        url,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/question/${questionId}`,
            Authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20', // hard-coded in js
        },
    });
    const listRes = response.data.data;

    ctx.state.data = {
        title: `知乎-${listRes[0].question.title}`,
        link: `https://www.zhihu.com/question/${questionId}`,
        item: listRes.map((item) => {
            const title = `${item.author.name}的回答：${item.excerpt}`;
            const description = `${item.author.name}的回答<br/><br/>${utils.ProcessImage(item.content)}`;

            return {
                title,
                description,
                author: item.author.name,
                pubDate: new Date(item.updated_time * 1000).toUTCString(),
                guid: item.id.toString(),
                link: `https://www.zhihu.com/question/${questionId}/answer/${item.id}`,
            };
        }),
    };
};
