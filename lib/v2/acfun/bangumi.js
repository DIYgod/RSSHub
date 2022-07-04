const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const url = `https://www.acfun.cn/bangumi/aa${id}`;

    const bangumiPage = await got(url, {
        headers: {
            Referer: 'https://www.acfun.cn',
        },
    });
    const bangumiData = JSON.parse(bangumiPage.data.match(/window.bangumiData = (.*?);\n/)[1]);
    const bangumiList = JSON.parse(bangumiPage.data.match(/window.bangumiList = (.*?);\n/)[1]);

    ctx.state.data = {
        title: bangumiData.bangumiTitle,
        link: url,
        description: bangumiData.bangumiIntro,
        image: bangumiData.belongResource.coverImageV,
        item: bangumiList.items.map((item) => ({
            title: `${item.episodeName} - ${item.title}`,
            description: `<img src="${item.imgInfo.thumbnailImage.cdnUrls[0].url.split('?')[0]}">`,
            link: `http://www.acfun.cn/bangumi/aa${id}_36188_${item.itemId}`,
            pubDate: parseDate(item.updateTime, 'x'),
        })),
    };
};
