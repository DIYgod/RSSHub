const got = require('@/utils/got');

module.exports = async (ctx) => {
    const currentUrl = `http://www.12379.cn/data/index_map_all.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });
    const data = JSON.parse(response.data.substr('var alertData ='.length, response.data.length + 1));

    const list = data.map((item) => ({
        title: item.headline,
        link: `http://www.12379.cn/html/new2018/alarmcontent.shtml?file=${item.identifier}.html`,
        description: item.description,
        pubDate: new Date(item.sendTime).toUTCString(),
    }));

    ctx.state.data = {
        title: `当前生效预警 - 国家突发事件预警信息发布网`,
        link: currentUrl,
        item: list,
    };
};
