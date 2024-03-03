// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const query = ctx.req.param('query') ?? ''; // beginDate=2018-08-18&endDate=2020-09-01&productId=600696
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
            _: Date.now(),
            ...queries,
        },
        headers: {
            Referer: pageUrl,
        },
    });

    const pdfHost = 'https://static.sse.com.cn';

    const items = response.data.result.map((item) => ({
        title: item.TITLE,
        description: `${pdfHost}${item.URL}`,
        pubDate: parseDate(item.ADDDATE),
        link: `${pdfHost}${item.URL}`,
        author: item.SECURITY_NAME,
    }));

    ctx.set('data', {
        title: `上海证券交易所 - 上市公司信息 - ${items[0].author}最新公告`,
        link: pageUrl,
        item: items,
    });
};
