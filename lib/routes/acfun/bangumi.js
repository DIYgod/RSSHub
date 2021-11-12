const got = require('@/utils/got');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `http://www.acfun.cn/bangumi/aa${id}`;

    const bangumiPage = await got({
        method: 'get',
        url,
        headers: {
            Referer: 'http://www.acfun.cn',
        },
    });
    const bangumiData = JSON.parse(bangumiPage.data.match(/window.bangumiData = (.*?);\n/)[1]);
    const bangumiList = JSON.parse(bangumiPage.data.match(/window.bangumiList = (.*?);\n/)[1]);

    ctx.state.data = {
        title: bangumiData.bangumiTitle,
        link: url,
        description: bangumiData.bangumiIntro,
        item: bangumiList.items.map((item) => ({
            title: `${item.episodeName} - ${item.title}`,
            description: `<img src="${item.image.split('?')[0]}">`,
            link: `http://www.acfun.cn/bangumi/aa${id}_36188_${item.itemId}`,
            pubDate: new Date(item.updateTime).toUTCString(),
        })),
    };
};
