const got = require('@/utils/got');
const date = require('@/utils/date');

const url = 'http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province=&_=1587017863577';

module.exports = async (ctx) => {
    const response = await got.get(url);
    const list = response.data.data.page.list;

    const out = await Promise.all(
        list.map(async (data) => {
            const title = data.title;
            const pubDate = date(data.issuetime, 8);
            const link = data.url;

            const single = {
                title: title,
                link: `http://www.nmc.cn${link}`,
                pubDate: pubDate,
            };
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: '中央气象台全国气象预警',
        link: 'http://www.nmc.cn/f/alarm.html',
        item: out,
    };
};
