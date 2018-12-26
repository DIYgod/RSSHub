const axios = require('../../utils/axios');
const qs = require('querystring');

module.exports = async (ctx) => {
    const { orgNo, provinceNo, scope = '' } = ctx.params;
    let { outageStartTime, outageEndTime } = ctx.params;
    if (!outageStartTime) {
        outageStartTime = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    }
    if (!outageEndTime) {
        outageEndTime = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    }
    const anHui = provinceNo === '34101' ? '01' : '02';
    const response = await axios({
        method: 'post',
        url: 'http://m.95598.cn/95598/woutageNotice/wqueryOutageNoticeList?partNo=BM08001',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: qs.stringify({
            orgNo,
            provinceNo,
            outageStartTime,
            outageEndTime,
            scope,
            anHui,
        }),
    });

    const items = (response.data.seleList || []).map((item) => {
        const title = `${item.subsName} | ${item.typeCode || ''}`;
        const description = `
        <strong>停电时间：</strong>${item.startTime} - ${item.stopTime} <br>
        <strong>停电范围：</strong>${item.scope} <br>
        <strong>停电线路：</strong>${item.lineName} <br>
        <strong>公变名称：</strong>${item.pubTranName} <br>
        <strong>停电原因：</strong>${item.poweroffReason} <br>
      `;
        const guid = item.powerOffId;
        const pubDate = new Date(item.startTime).toUTCString();

        return {
            title,
            description,
            guid,
            pubDate,
        };
    });

    ctx.state.data = {
        title: '国家电网停电通知',
        link: 'http://m.95598.cn/95598/woutageNotice/winitOutageNotice',
        item: items,
    };
};
