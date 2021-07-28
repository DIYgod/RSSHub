const got = require('@/utils/got');

module.exports = async (ctx) => {
    const warningMessagesJsonp = (
        await got({
            method: 'get',
            url: 'http://uc.cneb.gov.cn:8080/getWarningMessages?callback=func&start=0&pagetype=PAGE1409368873582889&rows=100&_=' + +new Date(),
        })
    ).data.trim();

    let warningMessages = [];

    try {
        const jsonString = warningMessagesJsonp.slice(5, -1);
        warningMessages = JSON.parse(jsonString).docs;
    } catch (error) {
        // console.error(error);
    }

    const items = warningMessages.map((item) => {
        const single = {
            title: item.title,
            description: item.content,
            pubDate: new Date(item.publishdate + ' UTC+08:00').toString(),
            link: item.url,
        };
        return single;
    });

    ctx.state.data = {
        title: '预警信息_国家应急广播网',
        link: 'http://www.cneb.gov.cn/yjxx/',
        description: '国家应急广播',
        item: items,
    };
};
