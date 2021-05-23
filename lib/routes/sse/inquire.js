const got = require('@/utils/got');
module.exports = async (ctx) => {
    const RefererUrl = 'http://www.sse.com.cn/disclosure/credibility/supervision/inquiries/';
    const response = await got({
        method: 'get',
        url: `http://query.sse.com.cn/commonSoaQuery.do?siteId=28&sqlId=BS_KCB_GGLL&extGGLX=&stockcode=&channelId=10743%2C10744%2C10012&extGGDL=&order=createTime%7Cdesc%2Cstockcode%7Casc&isPagination=true&pageHelp.pageSize=15&pageHelp.pageNo=1&pageHelp.beginPage=1&pageHelp.cacheSize=1&pageHelp.endPage=5&type=&_=1573371062879`,
        headers: {
            Referer: RefererUrl,
        },
    });
    const items = response.data.result.map((item) => {
        const single = {
            title: item.extGSJC,
            description: `<table border="1">
            <tr><td > 公司代码 : </td><td>${item.stockcode}</td></tr>
            <tr><td> 公司简称 : </td><td>${item.extGSJC}</td></tr>
            <tr><td> 发函日期 : </td><td>${item.createTime}</td></tr>
            <tr><td> 监管问询类型 : </td><td>${item.extWTFL}</td></tr>
            <tr><td> 标题 : </td><td><a href="http://${item.docURL}">${item.docTitle}</a></td></tr>
            </table>`,
            pubDate: new Date(`${item.createTime} GMT`).toUTCString(),
            link: `http://${item.docURL}`,
        };
        return single;
    });
    ctx.state.data = {
        title: `上海证券交易所——监管问询`,
        link: RefererUrl,
        item: items,
    };
};
