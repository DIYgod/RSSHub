const got = require('@/utils/got');

module.exports = async (ctx) => {
    const pageUrl = 'http://kcb.sse.com.cn/renewal/';
    const host = `http://kcb.sse.com.cn/`;

    const response = await got({
        method: 'get',
        url: `http://query.sse.com.cn/statusAction.do?isPagination=true&sqlId=SH_XM_LB&pageHelp.pageSize=20&offerType=&commitiResult=&registeResult=&csrcCode=&currStatus=&order=updateDate%7Cdesc&keyword=&auditApplyDateBegin=&auditApplyDateEnd=&_=${new Date().getTime()}`,
        headers: {
            Referer: pageUrl,
        },
    });
    function currStatus(e) {
        const currStatusName = ['全部', '已受理', '已询问', '通过', '未通过', '提交注册', '补充审核', '注册结果', '中止', '终止'];
        return currStatusName[e];
    }
    function sortDate(e) {
        const pubss = e.substr(12, 2);
        const pubmm = e.substr(10, 2);
        const pubhh = e.substr(8, 2);
        const pubday = e.substr(6, 2);
        const pubmonth = e.substr(4, 2);
        const pubyear = e.substr(0, 4);
        const pubdateString = pubmonth + `-` + pubday + `-` + pubyear + ' ' + pubhh + `:` + pubmm + `:` + pubss;
        // console.log(pubdateString);
        return pubdateString;
    }
    // console.log(response.data.result);
    const items = response.data.result.map((item) => {
        const single = {
            title: `【` + currStatus(item.currStatus) + `】${item.stockAuditName}`,
            description:
                `<table>
                <tr><th id="stockIssuer" desc="发行人全称">发行人全称</th><td>${item.stockAuditName}</td> </tr>
                <tr><th id="currStatus" desc="审核状态">审核状态</th><td>` +
                currStatus(item.currStatus) +
                `</td> </tr>
                <tr><th  desc="注册地">注册地</th><td>${item.stockIssuer[0].s_province}</td> </tr>
                <tr><th  desc="证监会行业">证监会行业</th><td>${item.stockIssuer[0].s_csrcCodeDesc}</td> </tr>
                <tr><th id="updateDate" desc="更新日期">更新日期</th><td>` +
                new Date(sortDate(item.updateDate)).toLocaleString() +
                `</td> </tr>
                <tr><th id="auditApplyDate" desc="受理日期">受理日期</th><td>` +
                new Date(sortDate(item.auditApplyDate)).toLocaleString() +
                `</td> </tr>
                <tr><th >详细链接</th><td><a href="http://kcb.sse.com.cn/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}">查看详情</a></td> </tr>
                </table>`,
            pubDate: new Date(sortDate(item.updateDate)).toLocaleString(),
            link: `${host}/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}`,
            author: currStatus(item.currStatus),
        };
        return single;
    });

    ctx.state.data = {
        title: '上证债券信息网 - 科创板项目动态',
        link: pageUrl,
        item: items,
    };
};
