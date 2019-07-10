const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { orgNo, provinceNo, scope = '', typeCode = '', lineName = '' } = ctx.params;
    let { outageStartTime, outageEndTime } = ctx.params;
    if (!outageStartTime) {
        outageStartTime = new Date(Date.now()).toISOString().slice(0, 10);
    }
    if (!outageEndTime) {
        outageEndTime = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    }
    const anHui = provinceNo === '34101' ? '01' : '02';
    const response = await got({
        method: 'post',
        url: 'http://www.95598.cn/95598/outageNotice/queryOutageNoticeList',
        form: true,
        data: {
            orgNo,
            outageStartTime,
            outageEndTime,
            scope,
            provinceNo,
            typeCode,
            lineName,
            anHui,
        },
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
        link: 'http://www.95598.cn/95598/outageNotice/initOutageNotice',
        item: items,
    };
};
