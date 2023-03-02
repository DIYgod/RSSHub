const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.zoo.team/api/articles',
    });
    const data = response.data.data.articles;
    ctx.state.data = {
        // 源标题
        title: '政采云前端博客',
        // 源链接
        link: 'https://www.zoo.team',
        // 源说明
        description: '政采云前端博客',
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: `${item.desc}<br><img src="${item.cover}">`,
            // 文章发布时间
            pubDate: timezone(parseDate(item.created_at), +8),
            // 文章链接
            link: `https://zoo.team/article/${item.path}`,
            // 分类
            category: item.category,
        })),
    };
};
