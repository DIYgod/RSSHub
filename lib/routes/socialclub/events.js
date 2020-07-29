const got = require('@/utils/got');
const { CookieJar } = require('tough-cookie');
const gameList = ['GTAV', 'RDR2'];
const eventTypeName = { InGameBonus: '游戏内奖励', InGameUnlock: '游戏内解锁', InGameDiscount: '游戏内折扣' };

module.exports = async (ctx) => {
    const gameId = gameList.includes(ctx.params.game) ? ctx.params.game : '';
    const res = await got({
        url: `https://zh-cn.socialclub.rockstargames.com/events/eventlisting?pageId=1&gameId=${gameId}&_=${Date.now()}`,
        headers: { 'accept-language': 'zh-CN,zh;q=0.9' },
        cookieJar: new CookieJar(),
    });
    const { events } = res.data;

    ctx.state.data = {
        title: '在线活动 - Rockstar Games Social Club',
        link: 'https://zh-cn.socialclub.rockstargames.com/events?gameId=' + gameId,
        item:
            events &&
            events.map((x) => ({
                title: x.headerText,
                category: eventTypeName[x.eventType] || x.eventType,
                description: (x.imgUrl ? `<img src="${x.imgUrl}" /><br>` : '') + x.description,
                pubDate: new Date(x.startDate).getTime() / 1000,
                link: x.linkToUrl ? `https://zh-cn.socialclub.rockstargames.com/${x.linkToUrl}/${x.urlHash}` : `https://zh-cn.socialclub.rockstargames.com/events/${x.urlHash}/${x.slug}/1`,
            })),
    };
};
