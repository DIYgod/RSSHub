const got = require('@/utils/got');

module.exports = async (ctx) => {
    const list = (
        await got({
            method: 'get',
            url: 'http://www.cneb.gov.cn/guoneinews/guoneidata/',
        })
    ).data.rollData;

    const items = list.map((item) => {
        const single = {
            title: item.title,
            description: item.description.replace(/<!\[CDATA\[.+?]]>/g, ''),
            pubDate: new Date(item.dateTime + ' UTC+08:00').toString(),
            link: item.url,
        };
        return single;
    });

    ctx.state.data = {
        title: '国内新闻_国家应急广播网',
        link: 'http://www.cneb.gov.cn/guoneinews/',
        description: '国家应急广播',
        item: items,
    };
};
