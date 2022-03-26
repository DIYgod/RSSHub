const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const typeMap = {
        1: 'IPO',
        2: '再融资',
        3: '重大资产重组',
    };

    const stageMap = {
        10: '受理',
        20: '问询',
        30: '上市委会议',
        35: '提交注册',
        40: '注册结果',
        50: '中止',
        60: '终止',
    };

    const statusMap = {
        20: '新受理',
        30: '已问询',
        45: '通过',
        44: '未通过',
        46: '暂缓审议',
        56: '复审通过',
        54: '复审不通过',
        60: '提交注册',
        70: '注册生效',
        74: '不予注册',
        78: '补充审核',
        76: '终止注册',
        80: '中止',
        90: '审核不通过',
        95: '撤回',
    };

    const type = ctx.params.type || '1';
    const stage = ctx.params.stage || '0';
    const status = ctx.params.status || '0';

    const rootUrl = 'http://listing.szse.cn';
    const apiUrl = `${rootUrl}/api/ras/projectrends/query?bizType=${type}${stage === '0' ? '' : `&stage=${stage}`}${status === '0' ? '' : `&status=${status}`}&pageIndex=0&pageSize=20`;

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.map((item) => ({
        title: item.prjid,
        link: `${rootUrl}/api/ras/projectrends/details?id=${item.prjid}`,
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const data = detailResponse.data.data;
                const current = JSON.parse(data.pjdot)['-1'];

                item.link = `${rootUrl}/projectdynamic/ipo/detail/index.html?id=${item.title}`;
                item.title = `[${data.prjst}] ${data.cmpnm} (${data.cmpsnm})- ${data.csrcind}`;

                item.description =
                    `<h1>${data.cmpnm}</h1><p></p>${current.startTime} ${current.name}<h2>项目基本信息</h2><table><tbody><tr><td class="title">公司全称</td>` +
                    `<td class="info">${data.cmpnm}</td>` +
                    `<td class="title">公司简称</td><td class="info">${data.cmpsnm}</td></tr>` +
                    `<tr><td class="title">受理日期</td><td class="info">${data.acptdt}</td>` +
                    `<td class="title">更新日期</td><td class="info">${data.updtdt}</td></tr>` +
                    `<tr><td class="title">审核状态</td><td class="info">${data.prjst}</td>` +
                    `<td class="title">预计融资金额(亿元)</td><td class="info">${data.maramt}</td></tr>` +
                    `<tr><td class="title">保荐机构</td>` +
                    `<td class="info"><a target="_blank" href="/projectdynamic/ipo/index.html?keywords=${data.sprinst}">${data.sprinst}</a></td>` +
                    `<td class="title">保荐代表人</td><td class="info"><span>${data.sprrep}</span></td></tr>` +
                    `<tr><td class="title">会计师事务所</td>` +
                    `<td class="info"><a target="_blank" href="/projectdynamic/ipo/index.html?keywords=${data.acctfm}">${data.acctfm}</a></td>` +
                    `<td class="title">签字会计师</td><td class="info">${data.acctsgnt}</td></tr>` +
                    `<tr><td class="title">律师事务所</td>` +
                    `<td class="info"><a target="_blank" href="/projectdynamic/ipo/index.html?keywords=${data.lawfm}">${data.lawfm}</a></td>` +
                    `<td class="title">签字律师</td><td class="info">${data.lglsgnt}</td></tr>` +
                    `<tr><td class="title">评估机构</td><td class="info">${data.evalinst}</td>` +
                    `<td class="title">签字评估师</td><td class="info">${data.evalsgnt}</td></tr>` +
                    `<tr><td class="title">最近一期审计基准日</td><td class="info" colspan="3">${data.lastestAuditEndDate}</td></tr></tbody></table>`;

                item.pubDate = parseDate(current.startTime, 'YYYY-MM-DD HH:mm:ss');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${typeMap[type]}项目动态${status !== '0' ? ` (${statusMap[status]}) ` : stage !== '0' ? ` (${stageMap[stage]}) ` : ''} - 创业板发行上市审核信息公开网站 - 深圳证券交易所`,
        link: `${rootUrl}/projectdynamic/${type}/index.html`,
        item: items,
    };
};
