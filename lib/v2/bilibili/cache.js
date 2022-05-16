const got = require('@/utils/got');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

module.exports = {
    getUsernameFromUID: async (ctx, uid) => {
        const key = 'bili-username-from-uid-' + uid;
        let name = await ctx.cache.get(key);
        if (!name) {
            const nameResponse = await got({
                method: 'get',
                url: `https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`,
            });
            name = nameResponse.data.data.name;
            ctx.cache.set(key, name);
        }
        return name;
    },
    getUsernameAndFaceFromUID: async (ctx, uid) => {
        const nameKey = 'bili-username-from-uid-' + uid;
        const faceKey = 'bili-userface-from-uid-' + uid;
        let name = await ctx.cache.get(nameKey);
        let face = await ctx.cache.get(faceKey);
        if (!name) {
            const nameResponse = await got({
                method: 'get',
                url: `https://api.bilibili.com/x/space/acc/info?mid=${uid}&jsonp=jsonp`,
            });
            name = nameResponse.data.data.name;
            face = nameResponse.data.data.face;
            ctx.cache.set(nameKey, name);
            ctx.cache.set(faceKey, face);
        }
        return [name, face];
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
    getVideoNameFromId: async (ctx, aid, bvid) => {
        const key = `bili-videoname-from-id-${bvid || aid}`;
        let name = await ctx.cache.get(key);

        if (!name) {
            const nameResponse = await got({
                method: 'get',
                url: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
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
    getCidFromId: async (ctx, aid, pid, bvid) => {
        const key = `bili-cid-from-id-${bvid || aid}-${pid}`;
        let cid = await ctx.cache.get(key);
        if (!cid) {
            const cidResponse = await got({
                method: 'get',
                url: `https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`,
                headers: {
                    Referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
                },
            });
            cid = cidResponse.data.data.pages[pid - 1].cid;
            ctx.cache.set(key, cid);
        }
        return cid;
    },
    getAidFromBvid: async (ctx, bvid) => {
        const key = `bili-cid-from-bvid-${bvid}`;
        let aid = await ctx.cache.get(key);
        if (!aid) {
            const response = await got({
                method: 'get',
                url: `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
                headers: {
                    Referer: `https://www.bilibili.com/video/${bvid}`,
                },
            });
            if (response.data && response.data.data && response.data.data.aid) {
                aid = response.data.data.aid;
            }
            ctx.cache.set(key, aid);
        }
        return aid;
    },
};
