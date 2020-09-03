const got = require('@/utils/got');

module.exports = async (ctx) => {
    const userUrl = `https://t.kongfz.com/api/getFeedList?userId=${ctx.params.id}&size=20`;
    const response = await got({
        method: 'get',
        url: userUrl,
    });

    const list = response.data.result.feedList.map((item) => ({
        title: item.title || item.postTime,
        link: `https://t.kongfz.com/detail/${item.feedId}`,
        description: item.type === 'text' ? item.content : `<a href="https://t.kongfz.com/detail/${item.feedId}">商品上架</a>`,
        pubDate: new Date(item.postDateTime).toUTCString(),
    }));

    const userInfo = response.data.result.userInfo;

    ctx.state.data = {
        title: `孔夫子旧书网 - ${userInfo.nickname}`,
        link: userInfo.shareUrl,
        item: list,
        description: `${userInfo.sign}`,
    };
};
