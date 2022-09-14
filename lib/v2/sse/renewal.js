const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const dayjs = require('dayjs');
const localizedFormat = require('dayjs/plugin/localizedFormat');
require('dayjs/locale/zh-cn');
dayjs.extend(localizedFormat);

const currStatusName = ['全部', '已受理', '已询问', '通过', '未通过', '提交注册', '补充审核', '注册结果', '中止', '终止'];

module.exports = async (ctx) => {
    const pageUrl = 'https://kcb.sse.com.cn/renewal/';
    const host = `https://kcb.sse.com.cn`;

    const response = await got('https://query.sse.com.cn/statusAction.do', {
        searchParams: {
            isPagination: true,
            sqlId: 'SH_XM_LB',
            'pageHelp.pageSize': 20,
            offerType: '',
            commitiResult: '',
            registeResult: '',
            province: '',
            csrcCode: '',
            currStatus: '',
            order: 'updateDate|desc,stockAuditNum|desc',
            keyword: '',
            auditApplyDateBegin: '',
            auditApplyDateEnd: '',
            _: new Date().getTime(),
        },
        headers: {
            Referer: pageUrl,
        },
    });

    // console.log(response.data.result);
    const items = response.data.result.map((item) => ({
        title: `【${currStatusName[item.currStatus]}】${item.stockAuditName}`,
        description: art(path.resolve(__dirname, 'templates/renewal.art'), {
            item,
            currStatus: currStatusName[item.currStatus],
            updateDate: dayjs(item.updateDate, 'YYYYMMDDHHmmss').locale('zh-cn').format('lll'),
            auditApplyDate: dayjs(item.auditApplyDate, 'YYYYMMDDHHmmss').locale('zh-cn').format('lll'),
        }),
        pubDate: parseDate(item.updateDate, 'YYYYMMDDHHmmss'),
        link: `${host}/renewal/xmxq/index.shtml?auditId=${item.stockAuditNum}`,
        author: item.stockAuditName,
    }));

    ctx.state.data = {
        title: '上海证券交易所 - 科创板项目动态',
        link: pageUrl,
        item: items,
    };
};
