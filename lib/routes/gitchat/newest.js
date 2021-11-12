const got = require('@/utils/got');

module.exports = async (ctx) => {
    const category = ctx.params.category && ctx.params.category !== 'all' ? ctx.params.category : '';
    const selected = ctx.params.selected;

    const response = await got(`https://gitbook.cn/activities?page=1&type=new&isSelected=${selected ? 'true' : 'false'}${category ? '&category=' + category : ''}`);
    const list = response.data.data;

    const category_name = category ? list[0].category.categoryName : '';

    ctx.state.data = {
        title: `GitChat ${category ? category_name + ' ' : ''}最新${selected ? '严选' : ''}`,
        link: 'https://gitbook.cn/',
        item: list.map((item) => ({
            title: item.title,
            author: item.authorId.customerName,
            description: `<p>${item.description}</p>`,
            pubDate: new Date(),
            link: `https://gitbook.cn/gitchat/activity/${item._id}`,
        })),
    };
};
