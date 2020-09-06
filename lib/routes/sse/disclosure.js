const got = require('@/utils/got');

module.exports = async (ctx) => {
    const query = ctx.params.query || ''; // beginDate=2018-08-18&endDate=2020-09-01&productId=600696
    const pageUrl = 'http://www.sse.com.cn/disclosure/listedinfo/announcement/';
    const host = `http://www.sse.com.cn`;

    const response = await got({
        method: 'get',
        url: `http://query.sse.com.cn/security/stock/queryCompanyBulletin.do?isPagination=true&keyWord=&securityType=0101%2C120100%2C020100%2C020200%2C120200&reportType2=&reportType=ALL&pageHelp.pageSize=25&pageHelp.pageCount=50&pageHelp.pageNo=1&pageHelp.beginPage=1&pageHelp.cacheSize=1&pageHelp.endPage=5&_=1598437657897&${query.replace(
            /([\u4e00-\u9fa5])/g,
            (str) => encodeURIComponent(str)
        )}`,
        headers: {
            Referer: 'http://www.sse.com.cn/disclosure/listedinfo/announcement/',
        },
    });

    const items = response.data.result.map((item) => {
        const single = {
            title: item.TITLE,
            description: `${host}${item.URL}`,
            pubDate: new Date(item.SSEDATE).toUTCString(),
            link: `${host}${item.URL}`,
        };
        return single;
    });

    ctx.state.data = {
        title: '上海证券交易所 - 上市公司信息 - 最新公告',
        link: pageUrl,
        item: items,
    };
};
