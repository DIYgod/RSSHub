const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const url = 'http://hfut.ahbys.com/API/Web/index10359.ashx?action=companylist&pagesize=20&pageindex=1&keyword=&rand=0.233333';
    const baseUrl = 'http://hfut.ahbys.com/company.html?cid=';
    const detailUrl = 'http://hfut.ahbys.com/API/Web/index10359.ashx?action=joblist&workkind=1&pagesize=9999&pageindex=1&rand=1&cid=';

    const jobDetailUrl = 'http://hfut.ahbys.com/API/Web/index10359.ashx?action=jobinfo&rand=0.233333&jid=';
    const jobDetailViewUrl = 'http://hfut.ahbys.com/jobinfo.html?jid=';
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: `http://hfut.ahbys.com/joblist.html`,
        },
    });
    const data = response.data.data;

    const jobs = [];
    await Promise.all(
        data.map(async (item) => {
            const responseTemp = await got({
                method: 'get',
                url: detailUrl + item.ID,
                headers: {
                    Referer: baseUrl + item.ID,
                },
            });
            const tempData = responseTemp.data.data;

            await tempData.forEach(async (itemTemp) => {
                const itemI = {
                    id: itemTemp.JobID,
                    UpdateDate: itemTemp.UpdateDate,
                };
                const responseTemp1 = await got({
                    method: 'get',
                    url: jobDetailUrl + itemTemp.JobID,
                    headers: {
                        Referer: baseUrl + itemTemp.ID,
                    },
                });
                const tempData1 = responseTemp1.data;
                itemI.JobName = '[' + tempData1.Salary + ']' + itemTemp.JobName + '(' + itemTemp.CompanyName + ')';
                itemI.content = '薪资范围：' + tempData1.Salary + '<br>' + '描述：' + tempData1.Describe + '<br>' + '要求：' + tempData1.Require + '<br>' + '公司简介：' + tempData1.Profile;
                jobs.push(itemI);
            });
        })
    );

    ctx.state.data = {
        // 源标题
        title: `合肥工业大学-就业信息网-重点单位招聘`,
        // 源链接
        link: `http://hfut.ahbys.com/joblist.html`,
        // 源说明
        description: `合肥工业大学-就业信息网-重点单位招聘`,
        item: jobs.map((item) => ({
            // 文章标题
            title: item.JobName,
            // 文章正文
            description: item.content,
            // 文章发布时间
            pubDate: parseDate(item.UpdateDate, 'YYYY-MM-DD'),
            // 文章链接
            link: jobDetailViewUrl + item.id,
        })),
    };
};
