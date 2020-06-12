const gameList = ['GTAV', 'RDR2'];

module.exports = async (ctx) => {
    const gameId = gameList.includes(ctx.params.game) ? ctx.params.game : '';
    const baseUrl = `https://zh-cn.socialclub.rockstargames.com/events/eventlisting?pageId=1&gameId=${gameId}`;
    // R星的傻逼防爬
    const browser = await require('@/utils/puppeteer')();
    const page = await browser.newPage();
    await page.goto(baseUrl + '&_=' + Date.now());
    // eslint-disable-next-line
    const jsonStr = await page.evaluate(() => document.body.innerText);
    browser.close();

    const { events } = JSON.parse(jsonStr);

    ctx.state.data = {
        title: '在线活动 - Rockstar Games Social Club',
        link: 'https://zh-cn.socialclub.rockstargames.com/events?gameId=' + gameId,
        item:
            events &&
            events.map((x) => ({
                title: x.headerText,
                category: x.eventType,
                description: (x.imgUrl ? `<img src="${x.imgUrl}" /><br>` : '') + x.description,
                pubDate: new Date(x.startDate).getTime() / 1000,
                link: `https://zh-cn.socialclub.rockstargames.com/events/${x.urlHash}/${x.slug}/1`,
            })),
    };
};
