const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got.get('https://xinquji.com/frontend/post/groups?cursor=0');

    ctx.state.data = {
        title: '新趣集今日最佳',
        link: 'https://xinquji.com',
        item: response.data.data.map((item) => ({
            title: item.name,
            description: `${item.name} ${item.description}`,
            link: 'https://xinquji.com/posts/' + item.id + '?utm_source=rsshub',
        })),
    };
};
