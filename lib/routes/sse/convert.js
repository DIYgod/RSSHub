const got = require('@/utils/got');

module.exports = async (ctx) => {
    const query = ctx.params.query || ''; // beginDate=2018-08-18&endDate=2019-08-18&companyCode=603283&title=股份
    const pageUrl = 'http://bond.sse.com.cn/disclosure/announ/convertible/#';
    const host = `http://www.sse.com.cn`;

    const response = await got({
        method: 'get',
        url: `http://query.sse.com.cn/infodisplay/queryBulletinKzzTipsNew.do?isPagination=true&pageHelp.pageSize=2&flag=0&_=${new Date().getTime()}&${query.replace(/([\u4e00-\u9fa5])/g, (str) => encodeURIComponent(str))}`,
        headers: {
            Referer: pageUrl,
        },
    });

    const items = response.data.result.map((item) => {
        const single = {
            title: item.title,
            description: `${host}${item.URL}`,
            pubDate: new Date(item.SSEDate).toUTCString(),
            link: `${host}${item.URL}`,
            author: item.security_Code,
        };
        return single;
    });

    ctx.state.data = {
        title: '上证债券信息网 - 可转换公司债券公告',
        link: pageUrl,
        item: items,
    };
};
