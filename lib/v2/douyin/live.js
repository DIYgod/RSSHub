const config = require('@/config').value;
const { getOriginAvatar } = require('./utils');

module.exports = async (ctx) => {
    const { rid } = ctx.params;
    if (isNaN(rid)) {
        throw Error('Invalid room ID. Room ID should be a number.');
    }

    const pageUrl = `https://live.douyin.com/${rid}`;

    const renderData = await ctx.cache.tryGet(
        `douyin:live:${rid}`,
        async () => {
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                request.resourceType() === 'document' ? request.continue() : request.abort();
            });
            await page.goto(pageUrl, {
                waitUntil: 'domcontentloaded',
            });
            const data = JSON.parse(decodeURIComponent(await page.evaluate(() => document.querySelector('#RENDER_DATA').innerText)));
            browser.close();

            return data;
        },
        config.cache.routeExpire,
        false
    );

    if (renderData[Object.keys(renderData).find((k) => renderData[k].status_code)].status_code !== '0') {
        throw `Status code ${renderData[Object.keys(renderData).find((k) => renderData[k].status_code)].status_code}`;
    }

    const roomInfo = renderData.app.initialState.roomStore.roomInfo;
    const nickname = roomInfo.anchor.nickname;
    const userAvatar = roomInfo.anchor.avatar_thumb.url_list[0];

    const items = [];
    if (roomInfo.roomId) {
        if (roomInfo.room.status === 2) {
            items.push({
                title: `开播：${roomInfo.room.title}`,
                link: pageUrl,
                author: nickname,
                guid: roomInfo.roomId, // roomId is unique for each live event
            });
        } else if (roomInfo.room.status === 4) {
            items.push({
                title: `当前直播已结束，期待下一场：${roomInfo.room.title}`,
                link: `https://www.douyin.com/user/${roomInfo.anchor.sec_uid}`,
                author: nickname,
                guid: roomInfo.roomId,
            });
        }
    }

    ctx.state.data = {
        title: `${nickname}的抖音直播间 - 抖音直播`,
        description: `欢迎来到${nickname}的抖音直播间，${nickname}与大家一起记录美好生活 - 抖音直播`,
        image: getOriginAvatar(userAvatar),
        link: pageUrl,
        item: items,
        allowEmpty: true,
    };
};
