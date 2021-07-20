const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'http://hfut.ahbys.com/API/Web/index10359.ashx?action=list4&rand=1&pageindex=1';
    const baseUrl = 'http://hfut.ahbys.com/j.html?id=';
    const detailUrl = 'http://hfut.ahbys.com/API/Web/index10359.ashx?action=j&rand=1&id=';

    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `http://hfut.ahbys.com/4.html`,
        },
    });
    const data = response.data.data;

    await Promise.all(
        data.map(async (item) => {
            const responseTemp = await got({
                method: 'get',
                url: detailUrl + item.ID,
                headers: {
                    Referer: baseUrl + item.ID,
                },
            });
            const tempData = responseTemp.data;
            item.content = tempData.d;
        })
    );

    ctx.state.data = {
        // 源标题
        title: `合肥工业大学-就业信息网-招聘信息`,
        // 源链接
        link: `http://hfut.ahbys.com/4.html`,
        // 源说明
        description: `合肥工业大学-就业信息网-招聘信息`,
        item: data.map((item) => ({
            // 文章标题
            title: item.JobName,
            // 文章正文
            description: item.content,
            // 文章发布时间
            pubDate: parseDate(item.UpdateDate, 'YYYY-MM-DD'),
            // 文章链接
            link: baseUrl + item.ID,
        })),
    };
};
