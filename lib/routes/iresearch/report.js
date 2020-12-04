const got = require('@/utils/got');
const date = require('@/utils/date');
async function processReport(item, ctx) {
    const apiUrl = `http://www.iresearch.com.cn/Detail/reportM?id=${item.NewsId}&isfree=0`;
    const pageUrl = 'http://www.iresearch.com.cn/m/report.shtml';
    const cache = await ctx.cache.get(apiUrl);
    if (cache) {
        return cache;
    }
    const response = await got({
        method: 'get',
        url: apiUrl,
        headers: {
            Referer: pageUrl,
            'Content-Type': 'application/json',
        },
    });

    const data = response.data.List[0];
    let description = data.Content + '<br>';
    const reportId = data.id;

    for (let i = 1; i <= data.PagesCount; i++) {
        description += `<img src="http://report.iresearch.cn/rimgs/${reportId}/${i}.jpg" rel="no-referrer"><br>`;
    }

    ctx.cache.set(apiUrl, description);
    return description;
}

module.exports = async (ctx) => {
    const apiUrl = 'http://www.iresearch.com.cn/products/GetReportList?classId=&fee=0&date=&lastId=&pageSize=6';
    const pageUrl = 'http://www.iresearch.com.cn/m/report.shtml';

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
        list.map(async (item) => {
            const other = await processReport(item, ctx);
            return {
                title: item.Title,
                description: other,
                pubDate: date(item.Uptime),
                link: item.VisitUrl,
            };
        })
    );

    ctx.state.data = {
        title: '艾瑞产业研究报告',
        link: pageUrl,
        description: '艾瑞产业研究报告',
        item: items,
    };
};
