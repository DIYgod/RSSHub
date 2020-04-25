const got = require('@/utils/got');

module.exports = async (ctx) => {
    const province = ctx.params.province || '&';
    const alarmInfoURL = `http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province=${province}`;
    const response = await got({
        method: 'get',
        url: alarmInfoURL,
    });
    const data = response.data.data;
    const list = data.page.list;

    ctx.state.data = {
        title: '中央气象台全国气象预警',
        link: `http://www.nmc.cn/publish/alarm.html`,
        item: list.map((item) => {
            const title = item.title;
            const url = item.url;
            return {
                title: `${title}`,
                link: `http://www.nmc.cn${url}`,
                pubDate: `${item.issuetime}`,
            };
        }),
    };
};
