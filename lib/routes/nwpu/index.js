const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.column;
    const token = ctx.params.token;

    const response = await got({
        method: 'get',
        url: `https://ecampus.nwpu.edu.cn/portal-web/api/proxy/xgdcms/api/rest/v1/cmsInterface/newList?columnId=${id}&pageIndex=0&itemsPerPage=20&loadAll=false&access_token=${token}`,
    });
    const data = response.data.data.data.data;
    const name = data.extras.channel.name;

    ctx.state.data = {
        title: `西北工业大学 - ${name}`,
        link: 'https://ecampus.nwpu.edu.cn/portal-web',
        description: `西北工业大学翱翔门户 - ${name}`,
        item: data.aaData.map((item) => ({
            title: item.title,
            description: item.contentDetail.body,
            pubDate: new Date(item.releaseDate),
            link: `https://ecampus.nwpu.edu.cn/portal-web/html/index.html?id=${item.id}#/news-detail`,
            category: item.releaseOrgName,
            author: item.contentDetail.textUser,
        })),
    };
};
