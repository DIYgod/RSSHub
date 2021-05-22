const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://weekly.zoo.team:3030/api/lastest/list`,
    });

    const data = response.data.data;
    const week = data[0].week;

    const items = data.map((ele) => {
        const { title, category, description, link } = ele;
        return {
            title, // 文章标题
            author: '', // 文章作者
            category, // 文章分类
            description, // 文章摘要或全文
            pubDate: '', // 文章发布时间
            link, // 指向文章的链接
        };
    });

    ctx.state.data = {
        title: `政采云前端小报第${week}期`, // 项目的标题
        link: `https://weekly.zoo.team/detail/${week}`, // 指向项目的链接
        description: `政采云前端小报第${week}期`, // 描述项目
        item: items,
    };
};
