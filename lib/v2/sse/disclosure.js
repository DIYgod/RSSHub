const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const query = ctx.params.query ?? ''; // beginDate=2018-08-18&endDate=2020-09-01&productId=600696
    const host = 'https://www.sse.com.cn';
    const queries = query.split('&').reduce((acc, cur) => {
        const [key, value] = cur.split('=');
        acc[key] = value;
        return acc;
    }, {});
    const pageUrl = `https://www.sse.com.cn/assortment/stock/list/info/announcement/index.shtml?productId=${queries.productId}`;

    const response = await got('https://query.sse.com.cn/security/stock/queryCompanyBulletin.do', {
        searchParams: {
            isPagination: true,
            securityType: '0101,120100,020100,020200,120200',
            reportType: 'ALL',
            'pageHelp.pageSize': 25,
            'pageHelp.pageCount': 50,
            'pageHelp.pageNo': 1,
            'pageHelp.beginPage': 1,
            'pageHelp.cacheSize': 1,
            'pageHelp.endPage': 5,
            _: new Date().getTime(),
            ...queries,
        },
        headers: {
            Referer: pageUrl,
        },
    });

    const items = response.data.result.map((item) => ({
        title: item.TITLE,
        description: `${host}${item.URL}`,
        pubDate: parseDate(item.ADDDATE),
        link: `${host}${item.URL}`,
        author: item.SECURITY_NAME,
    }));

    ctx.state.data = {
        title: `上海证券交易所 - 上市公司信息 - ${items[0].author}最新公告`,
        link: pageUrl,
        item: items,
    };
};
