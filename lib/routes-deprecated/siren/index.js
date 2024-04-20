const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `https://monster-siren.hypergryph.com/api/news`,
        headers: {
            Referer: `https://monster-siren.hypergryph.com/info`,
        },
    });

    const data = response.data.data.list;
    ctx.state.data = {
        // 源标题
        title: `塞壬唱片新闻`,
        // 源链接
        link: `https://monster-siren.hypergryph.com/info/`,
        // 源说明
        description: `塞壬唱片新闻`,
        // 遍历此前获取的数据
        item: data.map((item) => ({
            // 文章标题
            title: item.title,
            // 文章正文
            description: `${item.title}<br>${item.date}`,
            // 文章发布时间
            pubDate: parseDate(item.date),
            // 文章链接
            link: `https://monster-siren.hypergryph.com/info/${item.cid}`,
        })),
    };
};
