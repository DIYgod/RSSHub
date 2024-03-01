const got = require('@/utils/got');

const platforms = ['全部', 'Switch', 'PS4', 'PC', 'Xbox'];

module.exports = async (ctx) => {
    const platform = ctx.params.platform || 0;
    const url = `https://api.vgn.cn/apiv2/home/article?platform=${platform}&tab_id=-1&page=1&page_size=20`;

    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data.data;

    ctx.state.data = {
        title: `游戏动力资讯 ${platforms[platform]}`,
        link: 'https://vgn.cn/news',
        description: `游戏动力资讯 ${platforms[platform]}`,
        item: data.map((item) => ({
            title: item.title,
            description: item.content,
            pubDate: new Date(item.release_time * 1000).toUTCString(),
            link: `https://vgn.cn/article/news/${item.id}`,
        })),
    };
};
