const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://www.zoo.team/api/articles`,
    });

    const data = response.data.data.articles;

    const items = data.map((ele) => {
        const { title, category, desc, path, time, writer } = ele;
        return {
            title, // 文章标题
            author: writer, // 文章作者
            category, // 文章分类
            description: desc, // 文章摘要或全文
            pubDate: time, // 文章发布时间
            link: `https://www.zoo.team/article/${path}`, // 指向文章的链接
        };
    });

    ctx.state.data = {
        title: '政采云前端技术博客', // 项目的标题
        link: 'https://www.zoo.team', // 指向项目的链接
        description: '政采云前端技术博客', // 描述项目
        item: items,
    };
};
