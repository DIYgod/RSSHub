const got = require('@/utils/got');
const utils = require('./utils');

module.exports = {
    getCookie: (ctx) => {
        const key = 'bili-cookie';
        return ctx.cache.tryGet(key, async () => {
            // default Referer: https://www.bilibili.com is limited
            // Bilibili return cookies with multiple set-cookie
            const url = 'https://www.bilibili.com/';
            const response = await got(url, {
                headers: {
                    Referer: url,
                },
            });
            const setCookies = response.headers['set-cookie'];
            if (typeof setCookies === 'undefined') {
                return '';
            }
            return setCookies.map((cookie) => cookie.split(';')[0]).join('; ');
        });
    },
    getVerifyString: (ctx) => {
        const key = 'bili-verify-string';
        return ctx.cache.tryGet(key, async () => {
            const cookie = await module.exports.getCookie(ctx);
            const { data: navResponse } = await got('https://api.bilibili.com/x/web-interface/nav', {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie,
                },
            });
            const imgUrl = navResponse.data.wbi_img.img_url;
            const subUrl = navResponse.data.wbi_img.sub_url;
            const r = imgUrl.substring(imgUrl.lastIndexOf('/') + 1, imgUrl.length).split('.')[0] + subUrl.substring(subUrl.lastIndexOf('/') + 1, subUrl.length).split('.')[0];
            const { body: spaceResponse } = await got('https://space.bilibili.com/1', {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie,
                },
            });
            const jsUrl = 'https:' + spaceResponse.match(/[^"]*9.space[^"]*/);
            const { body: jsResponse } = await got(jsUrl, {
                headers: {
                    Referer: 'https://space.bilibili.com/1',
                },
            });
            const array = JSON.parse(jsResponse.match(/\[(?:\d+,){63}\d+\]/));
            const o = [];
            array.forEach((t) => {
                r.charAt(t) && o.push(r.charAt(t));
            });
            return o.join('').slice(0, 32);
        });
    },
    getUsernameFromUID: (ctx, uid) => {
        const key = 'bili-username-from-uid-' + uid;
        return ctx.cache.tryGet(key, async () => {
            const cookie = await module.exports.getCookie(ctx);
            const verifyString = await module.exports.getVerifyString(ctx);
            await got(`https://space.bilibili.com/${uid}/`, {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie,
                },
            });
            const params = utils.addVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, verifyString);
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?${params}`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            return nameResponse.data.name;
        });
    },
    getUsernameAndFaceFromUID: async (ctx, uid) => {
        const nameKey = 'bili-username-from-uid-' + uid;
        const faceKey = 'bili-userface-from-uid-' + uid;
        let name = await ctx.cache.get(nameKey);
        let face = await ctx.cache.get(faceKey);
        if (!name || !face) {
            const cookie = await module.exports.getCookie(ctx);
            const verifyString = await module.exports.getVerifyString(ctx);
            await got(`https://space.bilibili.com/${uid}/`, {
                headers: {
                    Referer: `https://www.bilibili.com/`,
                    Cookie: cookie,
                },
            });
            const params = utils.addVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, verifyString);
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?${params}`, {
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
