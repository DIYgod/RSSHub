const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseURL = 'https://www.tokeninsight.com/';
const title = 'TokenInsight';
const link = 'https://www.tokeninsight.com/';

module.exports = async (ctx) => {
    const lang = ctx.params.lang ?? 'zh';

    const getReports = async () => {
        const url = `${baseURL}api/user/search/getAllList`;
        const response = (
            await got.post(url, {
                form: {
                    isRecommend: 2,
                    language: lang === 'zh' ? 'cn' : lang,
                },
            })
        ).data;
        return response.data.reportList;
    };

    const getReportInfomation = async (report) => {
        const { publishDate, title, id } = report;
        const reportUrl = `${baseURL}${lang}/report/${id}`;
        const description = await ctx.cache.tryGet(reportUrl, async () => {
            const res = await got(reportUrl);
            const $ = cheerio.load(res.data);
            const description = $('.detail_html_box').html();
            return description;
        });
        return {
            // 文章标题
            title,
            // 文章正文
            description,
            // 文章发布时间
            pubDate: parseDate(publishDate),
            // 文章链接
            link: reportUrl,
        };
    };
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 30;
    const reports = (await getReports()).slice(0, limit);
    const list = await Promise.all(reports.map(getReportInfomation));
    ctx.state.data = {
        title: `${lang === 'zh' ? '报告' : 'Research'} | ${title}`,
        link: `${link}${lang}/report`,
        item: list,
    };
};
