const got = require('@/utils/got');

module.exports = {
    getCookie: (ctx) => {
        const key = 'bili-cookie';
        return ctx.cache.tryGet(key, async () => {
            const response = await got(`https://www.bilibili.com/`);
            return response.headers['set-cookie'];
        });
    },
    getUsernameFromUID: (ctx, uid) => {
        const key = 'bili-username-from-uid-' + uid;
        return ctx.cache.tryGet(key, async () => {
            const cookie = await module.exports.getCookie(ctx);
            await got(`https://space.bilibili.com/${uid}/`, {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie,
                },
            });
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&token=&platform=web&jsonp=jsonp`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            return nameResponse.data.name;
        });
    },
    getUsernameAndFaceFromUID: async (ctx, uid) => {
        const cookie = await module.exports.getCookie(ctx);
        const nameKey = 'bili-username-from-uid-' + uid;
        const faceKey = 'bili-userface-from-uid-' + uid;
        let name = await ctx.cache.get(nameKey);
        let face = await ctx.cache.get(faceKey);
        if (!name || !face) {
            await got(`https://space.bilibili.com/${uid}/`, {
                headers: {
                    Referer: `https://www.bilibili.com/`,
                    Cookie: cookie,
                },
            });
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/acc/info?mid=${uid}&token=&platform=web&jsonp=jsonp`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            name = nameResponse.data.name;
            face = nameResponse.data.face;
            ctx.cache.set(nameKey, name);
            ctx.cache.set(faceKey, face);
        }
        return [name, face];
    },
    getLiveIDFromShortID: (ctx, shortID) => {
        const key = `bili-liveID-from-shortID-${shortID}`;
        return ctx.cache.tryGet(key, async () => {
            const { data: liveIDResponse } = await got(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${shortID}`, {
                headers: {
                    Referer: `https://live.bilibili.com/${shortID}`,
                },
            });
            return liveIDResponse.data.room_id;
        });
    },
    getUsernameFromLiveID: (ctx, liveID) => {
        const key = `bili-username-from-liveID-${liveID}`;
        return ctx.cache.tryGet(key, async () => {
            const { data: nameResponse } = await got(`https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`, {
                headers: {
                    Referer: `https://live.bilibili.com/${liveID}`,
                },
            });
            return nameResponse.data.info.uname;
        });
    },
    getVideoNameFromId: (ctx, aid, bvid) => {
        const key = `bili-videoname-from-id-${bvid || aid}`;
        return ctx.cache.tryGet(key, async () => {
            const { data } = await got(`https://api.bilibili.com/x/web-interface/view`, {
                searchParams: {
                    aid: aid ? aid : undefined,
                    bvid: bvid ? bvid : undefined,
                },
                referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
            });
            return data.data.title;
        });
    },
    getCidFromId: (ctx, aid, pid, bvid) => {
        const key = `bili-cid-from-id-${bvid || aid}-${pid}`;
        return ctx.cache.tryGet(key, async () => {
            const { data } = await got(`https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`, {
                referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
            });
            return data.data.pages[pid - 1].cid;
        });
    },
    getAidFromBvid: async (ctx, bvid) => {
        const key = `bili-cid-from-bvid-${bvid}`;
        let aid = await ctx.cache.get(key);
        if (!aid) {
            const response = await got(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
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
