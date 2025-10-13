const config = require('@/config').value;
const { getOriginAvatar } = require('./utils');
const logger = require('@/utils/logger');

module.exports = async (ctx) => {
    const { rid } = ctx.params;
    if (isNaN(rid)) {
        throw Error('Invalid room ID. Room ID should be a number.');
    }

    const pageUrl = `https://live.douyin.com/${rid}`;

    const renderData = await ctx.cache.tryGet(
        `douyin:live:${rid}`,
        async () => {
            let roomInfo;
            const browser = await require('@/utils/puppeteer')();
            const page = await browser.newPage();
            await page.setRequestInterception(true);

            page.on('request', (request) => {
                request.resourceType() === 'document' || request.resourceType() === 'script' || request.resourceType() === 'xhr' ? request.continue() : request.abort();
            });
            page.on('response', async (response) => {
                const request = response.request();
                if (request.url().includes('/webcast/room/web/enter')) {
                    roomInfo = await response.json();
                }
            });
            logger.debug(`Requesting ${pageUrl}`);
            await page.goto(pageUrl, {
                waitUntil: 'networkidle2',
            });
            browser.close();

            return roomInfo;
        },
        config.cache.routeExpire,
        false
    );

    if (renderData.status_code !== 0) {
        throw Error(`Status code ${renderData.status_code}`);
    }

    const roomInfo = renderData.data.data[0];
    const roomOwner = renderData.data.user;
    const nickname = roomOwner.nickname;
    const userAvatar = roomOwner.avatar_thumb.url_list[0];

    const items = [];
    if (roomInfo.id_str) {
        if (roomInfo.status === 2) {
            items.push({
                title: `开播：${roomInfo.title}`,
                description: `<img src="${roomInfo.cover.url_list[0]}">`,
                link: pageUrl,
                author: nickname,
                guid: roomInfo.id_str, // roomId is unique for each live event
            });
        } else if (roomInfo.status === 4) {
            items.push({
                title: `当前直播已结束，期待下一场：${roomInfo.title}`,
                link: `https://www.douyin.com/user/${roomOwner.sec_uid}`,
                author: nickname,
                guid: roomInfo.id_str,
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
