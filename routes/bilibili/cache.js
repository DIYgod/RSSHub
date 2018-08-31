const axios = require('../../utils/axios');
const qs = require('querystring');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');

module.exports = {
    getUsernameFromUID: async (ctx, uid) => {
        const key = 'bili-username-from-uid-' + uid;
        let name = await ctx.cache.get(key);
        if (!name) {
            const nameResponse = await axios({
                method: 'post',
                url: 'https://space.bilibili.com/ajax/member/GetInfo',
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                data: qs.stringify({
                    mid: uid,
                }),
            });
            name = nameResponse.data.data.name;
            ctx.cache.set(key, name, 24 * 60 * 60);
        }
        return name;
    },
    getLiveIDFromShortID: async (ctx, shortID) => {
        const key = `bili-liveID-from-shortID-${shortID}`;
        let liveID = await ctx.cache.get(key);
        if (!liveID) {
            const liveIDResponse = await axios({
                method: 'get',
                url: `https://api.live.bilibili.com/room/v1/Room/room_init?id=${shortID}`,
                headers: {
                    Referer: `https://live.bilibili.com/${shortID}`,
                },
            });
            liveID = liveIDResponse.data.data.room_id;
            ctx.cache.set(key, liveID, 24 * 60 * 60);
        }
        return liveID;
    },
    getUsernameFromLiveID: async (ctx, liveID) => {
        const key = `bili-username-from-liveID-${liveID}`;
        let name = await ctx.cache.get(key);

        if (!name) {
            const nameResponse = await axios({
                method: 'get',
                url: `https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`,
                headers: {
                    Referer: `https://live.bilibili.com/${liveID}`,
                },
            });
            name = nameResponse.data.data.info.uname;
            ctx.cache.set(key, name, 24 * 60 * 60);
        }
        return name;
    },
    getVideoNameFromAid: async (ctx, aid) => {
        const key = `bili-videoName-from-aid-${aid}`;
        let name = await ctx.cache.get(key);

        if (!name) {
            const nameResponse = await axios({
                method: 'get',
                url: `https://www.bilibili.com/video/av${aid}`,
                responseType: 'arraybuffer',
            });
            const responseHtml = iconv.decode(nameResponse.data, 'UTF-8');
            const $ = cheerio.load(responseHtml);
            name = $('title').text();
            name = name.substr(0, name.indexOf('_哔哩哔哩'));
            ctx.cache.set(key, name, 24 * 60 * 60);
        }
        return name;
    },
    getFavNameFromFid: async (ctx, fid, uid) => {
        const key = `bili-favName-from-fid-${fid}`;
        let name = await ctx.cache.get(key);

        if (!name) {
            const nameResponse = await axios({
                method: 'get',
                url: `https://api.bilibili.com/x/space/fav/nav?mid=${uid}`,
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/#/favlist`,
                },
            });
            if (nameResponse && nameResponse.data && nameResponse.data.data && nameResponse.data.data.archive) {
                nameResponse.data.data.archive.forEach((item) => {
                    // noinspection EqualityComparisonWithCoercionJS
                    if (fid === item.fid.toString()) {
                        name = item.name;
                    }
                });
            }
            ctx.cache.set(key, name, 24 * 60 * 60);
        }
        if (!name) {
            name = 'Unknown';
        }
        return name;
    },
};
