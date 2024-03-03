// @ts-nocheck
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const query = ctx.req.param('query') ?? ''; // beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份
    const pageUrl = 'https://bond.sse.com.cn/disclosure/announ/convertible/';
    const host = 'https://www.sse.com.cn';

    const response = await got('https://query.sse.com.cn/infodisplay/queryBulletinKzzTipsNew.do', {
        searchParams: {
            isPagination: true,
            'pageHelp.pageSize': 20,
            flag: 0,
            _: Date.now(),
            ...query.split('&').reduce((acc, cur) => {
                const [key, value] = cur.split('=');
                acc[key] = value;
                return acc;
            }, {}),
        },
        headers: {
            Referer: pageUrl,
        },
    });

    const items = response.data.result.map((item) => ({
        title: item.title,
        description: `${host}${item.URL}`,
        pubDate: parseDate(item.ADDDATE),
        link: `${host}${item.URL}`,
        author: item.security_Code,
    }));

    ctx.set('data', {
        title: '上证债券信息网 - 可转换公司债券公告',
        link: pageUrl,
        item: items,
    });
};
