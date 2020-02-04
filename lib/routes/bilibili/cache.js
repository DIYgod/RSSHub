const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

module.exports = {
    getUsernameFromUID: async (ctx, uid) => {
        const key = 'bili-username-from-uid-' + uid;
        let name = await ctx.cache.get(key);
        if (!name) {
            const nameResponse = await got({
                method: 'post',
                url: 'https://space.bilibili.com/ajax/member/GetInfo',
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                },
                form: {
                    mid: uid,
                },
            });
            name = nameResponse.data.data.name;
            ctx.cache.set(key, name);
        }
        return name;
    },
    getLiveIDFromShortID: async (ctx, shortID) => {
        const key = `bili-liveID-from-shortID-${shortID}`;
        let liveID = await ctx.cache.get(key);
        if (!liveID) {
            const liveIDResponse = await got({
                method: 'get',
                url: `https://api.live.bilibili.com/room/v1/Room/room_init?id=${shortID}`,
                headers: {
                    Referer: `https://live.bilibili.com/${shortID}`,
                },
            });
            liveID = liveIDResponse.data.data.room_id;
            ctx.cache.set(key, liveID);
        }
        return liveID;
    },
    getUsernameFromLiveID: async (ctx, liveID) => {
        const key = `bili-username-from-liveID-${liveID}`;
        let name = await ctx.cache.get(key);

        if (!name) {
            const nameResponse = await got({
                method: 'get',
                url: `https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`,
                headers: {
                    Referer: `https://live.bilibili.com/${liveID}`,
                },
            });
            name = nameResponse.data.data.info.uname;
            ctx.cache.set(key, name);
        }
        return name;
    },
    getVideoNameFromAid: async (ctx, aid) => {
        const key = `bili-videoName-from-aid-${aid}`;
        let name = await ctx.cache.get(key);

        if (!name) {
            const nameResponse = await got({
                method: 'get',
                url: `https://www.bilibili.com/video/av${aid}`,
                responseType: 'buffer',
            });
            const responseHtml = iconv.decode(nameResponse.data, 'UTF-8');
            const $ = cheerio.load(responseHtml);
            name = $('title').text();
            name = name.substr(0, name.indexOf('_哔哩哔哩'));
            ctx.cache.set(key, name);
        }
        return name;
    },
    getCidFromAid: async (ctx, aid, pid) => {
        const key = `bili-Cid-from-Aid-${aid}-${pid}`;
        let cid = await ctx.cache.get(key);
        if (!cid) {
            const cidResponse = await got({
                method: 'get',
                url: `https://api.bilibili.com/x/web-interface/view?aid=${aid}`,
                headers: {
                    Referer: `https://www.bilibili.com/video/av${aid}`,
                },
            });
            if (cidResponse && cidResponse.data && cidResponse.data.data && cidResponse.data.data.pages && cidResponse.data.data.pages.length >= pid) {
                cid = cidResponse.data.data.pages[pid - 1].cid;
            }
            if (!cid) {
                ctx.cache.set(key, cid);
            }
        }
        return cid;
    },
};
