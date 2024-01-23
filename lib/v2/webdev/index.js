const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {

    const response = await got({
        method: 'post',
        body: '[null, null, null, "type:blog", null, null, null, null, 31, null, null, null, 2]',
        url: 'https://web.dev/_d/dynamic_content?hl=en',
    });

    if (!response?.data?.startsWith(`)]}'`)) {
        throw new Error('Bad response format');
    }

    const data = JSON.parse(response.data.substring(4))[0];

    const items = data.map((item) => ({
        // 文章标题
        title: item[0],
        // 文章链接
        link: item[6],
        // 文章正文
        description: item[4],
        // 文章发布日期
        pubDate: new Date(item[5][0] * 1000),
        // 如果有的话，文章作者
        author: item[17],
        // 如果有的话，文章分类
        category: item[20],
    }));

    ctx.state.data = {
        title: 'web.dev Blog',
        link: 'https://web.dev/blog?hl=en',
        item: items,
    };
};
