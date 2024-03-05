// @ts-nocheck
import cache from '@/utils/cache';
import { config } from '@/config';
const { getOriginAvatar } = require('./utils');
import logger from '@/utils/logger';
import puppeteer from '@/utils/puppeteer';

export default async (ctx) => {
    const rid = ctx.req.param('rid');
    if (isNaN(rid)) {
        throw new TypeError('Invalid room ID. Room ID should be a number.');
    }

    const pageUrl = `https://live.douyin.com/${rid}`;

    const renderData = await cache.tryGet(
        `douyin:live:${rid}`,
        async () => {
            let roomInfo;
            const browser = await puppeteer();
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
            logger.http(`Requesting ${pageUrl}`);
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
        throw new Error(`Status code ${renderData.status_code}`);
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

    ctx.set('data', {
        title: `${nickname}的抖音直播间 - 抖音直播`,
        description: `欢迎来到${nickname}的抖音直播间，${nickname}与大家一起记录美好生活 - 抖音直播`,
        image: getOriginAvatar(userAvatar),
        link: pageUrl,
        item: items,
        allowEmpty: true,
    });
};
