const got = require('@/utils/got');

module.exports = async (ctx) => {
    const data = (
        await got({
            method: 'post',
            url: 'https://qiao.sf-express.com/menu/getListNews.pub',
            json: true,
            data: {},
        })
    ).data;

    ctx.state.data = {
        title: '顺丰丰桥开放平台-公告',
        link: 'https://qiao.sf-express.com/pages/news/index.html',
        item: data.latesnewsList.map((item) => ({
            title: item.title,
            description: '',
            pubDate: '',
            link: `https://qiao.sf-express.com/pages/news/index.html?id=${item.id}`,
        })),
    };
};
