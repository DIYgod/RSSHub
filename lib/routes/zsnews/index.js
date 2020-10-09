const got = require('@/utils/got');

module.exports = async (ctx) => {
    ctx.params.cateid = ctx.params.cateid || '35';

    const response = await got.get(`http://www.zsnews.cn/api/mobile/getlist.html?cateid=${ctx.params.cateid}`);

    ctx.state.data = {
        title: '中山新闻',
        link: 'https://www.zsnews.cn/',
        item: response.data.map((item) => ({
            guid: item.id,
            title: item.title,
            description: item.title,
            link: item.url,
        })),
    };
};
