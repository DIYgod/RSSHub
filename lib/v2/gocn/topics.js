const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const api_url = 'https://gocn.vip/api/topic/list?currentPage=1&cate2Id=0&grade=new';
    const base_url = 'https://gocn.vip/topics';

    const response = await got({
        method: 'get',
        url: api_url,
        headers: {
            Referer: base_url,
        },
    });
    const data = response.data.data.list;

    ctx.state.data = {
        title: `GoCN社区文章`,
        link: `https://gocn.vip`,
        description: `获取GoCN站点最新文章`,
        item: data.map((item) => ({
            title: item.title,
            description: item.summary,
            link: `${base_url}/${item.id}`,
            pubDate: parseDate(item.ctime * 1000),
        })),
    };
};
