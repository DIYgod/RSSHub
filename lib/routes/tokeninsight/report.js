const got = require('@/utils/got');
const cheerio = require('cheerio');
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';
const getReports = async () => {
    const url = `${baseURL}api/user/search/getAllList`;
    const response = (
        await got.post(url, {
            form: {
                isRecommend: 2,
                language: 'cn',
            },
        })
    ).data;
    return response.data.reportList;
};
module.exports = async (ctx) => {
    const getReportInfomation = async (report) => {
        const { publishDate, title, id } = report;
        const reportUrl = `${baseURL}zh/report/${id}`;
        const description = await ctx.cache.tryGet(reportUrl, async () => {
            const res = await got(reportUrl);
            const $ = cheerio.load(res.data);
            const description = $('.detail_html_box').html();
            return description;
        });
        return {
            // 文章标题
            title: String(title),
            // 文章正文
            description,
            // 文章发布时间
            pubDate: new Date(publishDate).toUTCString(),
            // 文章链接
            link: reportUrl,
        };
    };
    const limit = ctx.request.query.limit || 30;
    const reports = (await getReports()).slice(0, limit);
    const list = await Promise.all(reports.map(getReportInfomation));
    ctx.state.data = {
        title,
        link,
        item: list,
    };
};
