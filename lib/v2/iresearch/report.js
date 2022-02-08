const got = require('@/utils/got');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

function processReport(item, ctx) {
    const apiUrl = `https://www.iresearch.com.cn/api/Detail/reportM?id=${item.NewsId}&isfree=0`;
    const pageUrl = 'https://www.iresearch.com.cn/m/report.shtml';

    const description = ctx.cache.tryGet(apiUrl, async () => {
        const response = await got({
            method: 'get',
            url: apiUrl,
            headers: {
                Referer: pageUrl,
                'Content-Type': 'application/json',
            },
        });
        const data = response.data.List[0];

        return art(path.join(__dirname, 'templates/report.art'), {
            data,
        });
    });

    return description;
}

module.exports = async (ctx) => {
    const limit = isNaN(parseInt(ctx.query.limit)) ? 20 : parseInt(ctx.query.limit);
    const apiUrl = `https://www.iresearch.com.cn/api/products/GetReportList?fee=0&date=&lastId=&pageSize=${limit}`;
    const pageUrl = 'https://www.iresearch.com.cn/m/report.shtml';

    const resp = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
    });

    const list = resp.data.List;
    const items = await Promise.all(
        list.map(async (item) => ({
            title: item.Title,
            description: await processReport(item, ctx),
            pubDate: timezone(parseDate(item.Uptime), +8),
            link: item.VisitUrl,
        }))
    );

    ctx.state.data = {
        title: '艾瑞产业研究报告',
        link: pageUrl,
        description: '艾瑞产业研究报告',
        item: items,
    };
};
