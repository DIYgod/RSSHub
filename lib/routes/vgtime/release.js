const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `http://app02.vgtime.com:8080/vgtime-app/api/v2/game/last/sales`,
    });
    const data = response.data.data.gameList;

    ctx.state.data = {
        title: `游戏时光游戏发售表`,
        link: `https://www.vgtime.com/game/release.jhtml`,
        item: data.map((item) => ({
            title: item.title,
            description: `平台：${item.platformsText}；${item.introduction}`,
            pubDate: item.publishDate,
            link: item.shareUrl,
        })),
    };
};
