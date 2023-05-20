const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const sortCreatedOnTime = (a, b) => {
    const t1 = timezone(parseDate(a.createdOn, 'YYYY-MM-DD HH:mm:ss'), +8);
    const t2 = timezone(parseDate(b.createdOn, 'YYYY-MM-DD HH:mm:ss'), +8);
    if (t1 > t2){ return 1 };
    if (t1 === t2){ return 0 };
    if (t1 < t2) { return -1 };
};
module.exports = async (ctx) => {
    const url = 'https://szgk.sz-water.com.cn/api/wechat/op/getStopWaterNotice';
    const response = await got({
        method: 'get',
        url,
    });

    const data = response.data.data;
    data.sort((sortCreatedOnTime));

    ctx.state.data = {
        title: '停水通知 - 深圳水务',
        link: 'https://www.sz-water.com.cn/',
        item: data.map((item) => ({
            title: `${item.position}${item.stoptime}`,
            description: `${item.title}-${item.reginName}(影响用户${item.affectUser}),[${item.stopwaterType}]原因${item.reason},停水开始时间${item.stopStartTime},停水结束时间${item.stopEndTime}`,
            pubDate: `${timezone(parseDate(item.createdOn, 'YYYY-MM-DD HH:mm:ss'), +8)}`,
            link: `https://szgk.sz-water.com.cn/wechat_web/Water_stop.html`,
        })),
    };
};
