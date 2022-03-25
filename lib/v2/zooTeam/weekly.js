const got = require('@/utils/got');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://weekly.zoo.team:3030/api/lastest/list',
    });
    const data = response.data.data;
    ctx.state.data = {
        // 源标题
        title: '政采云前端小报',
        // 源链接
        link: 'https://weekly.zoo.team/',
        // 源说明
        description: '政采云前端小报',
        // 有可能接口返回为空
        allowEmpty: true,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: item.description,
            // 文章发布时间
            pubDate: timezone(parseDate(item.timestamp * 1000), +8),
            // 文章链接
            link: item.link,
            // 分类
            category: item.category,
        })),
    };
};
