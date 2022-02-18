const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://zdscxx.moa.gov.cn:8080/misportal/echartReport/webData/%E6%9C%80%E6%96%B0%E5%8F%91%E5%B8%83/page1.json`,
    });
    const data = response.data;

    ctx.state.data = {
        title: '中华人民共和国农业农村部 - 数据 - 最新发布',
        link: `http://zdscxx.moa.gov.cn:8080/nyb/pc/index.jsp`,
        item: data.map((item) => ({
            title: item.title,
            description: item.content,
            link: `http://zdscxx.moa.gov.cn:8080/misportal/public/agricultureMessageViewDC.jsp?page=1&channel=%E6%9C%80%E6%96%B0%E5%8F%91%E5%B8%83&id=${item._id}`,
            pubDate: new Date(item.publishTime),
        })),
    };
};
