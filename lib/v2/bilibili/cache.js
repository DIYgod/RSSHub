const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');
const config = require('@/config').value;
const logger = require('@/utils/logger');

module.exports = {
    getCookie: (ctx) => {
        if (Object.keys(config.bilibili.cookies).length > 0) {
            return config.bilibili.cookies[Object.keys(config.bilibili.cookies)[Math.floor(Math.random() * Object.keys(config.bilibili.cookies).length)]];
        }
        const key = 'bili-cookie';
        return ctx.cache.tryGet(key, async () => {
            // default Referer: https://www.bilibili.com is limited
            // Bilibili return cookies with multiple set-cookie
            let response = await got('https://space.bilibili.com/1');
            const setCookie = response.headers['set-cookie']; // should contain buvid3 and b_nut
            if (typeof setCookie === 'undefined') {
                return '';
            }
            const cookie = setCookie.map((cookie) => cookie.split(';')[0]);
            cookie.push(['b_lsid', utils.lsid()].join('='));
            cookie.push(['_uuid', utils._uuid()].join('='));
            response = await got('https://api.bilibili.com/x/frontend/finger/spi', {
                headers: {
                    Referer: 'https://www.bilibili.com/',
                    Cookie: cookie.join('; '),
                },
            });
            cookie.push(['bvuid4', encodeURIComponent(response.data.data.b_4)].join('='));
            const e = Math.floor(Date.now() / 1000);
            const hexsign = utils.hexsign(e);
            // await got('https://space.bilibili.com/1', {
            //     headers: {
            //         Referer: 'https://www.bilibili.com/',
            //         Cookie: cookie.join('; '),
            //     },
            // });
            try {
                response = await got.post(`https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket?key_id=ec02&hexsign=${hexsign}&context[ts]=${e}&csrf=`, {
                    headers: {
                        Referer: 'https://space.bilibili.com/1',
                        Cookie: cookie.join('; '),
                    },
                });
                cookie.push(['bili_ticket', response.data.data.ticket].join('='));
                cookie.push(['bili_ticket_expires', (parseInt(response.data.data.created_at) + parseInt(response.data.data.ttl)).toString()].join('='));
            } catch (e) {
                // HTTPError: Response code 429 (Too Many Requests)
            }

            return cookie.join('; ');
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
            // const { body: spaceResponse } = await got('https://space.bilibili.com/1', {
            //     headers: {
            //         Referer: 'https://www.bilibili.com/',
            //         Cookie: cookie,
            //     },
            // });
            // const jsUrl = 'https:' + spaceResponse.match(/[^"]*9.space[^"]*/);
            const jsUrl = 'https://s1.hdslb.com/bfs/seed/laputa-header/bili-header.umd.js';
            const { body: jsResponse } = await got(jsUrl, {
                headers: {
                    Referer: 'https://space.bilibili.com/1',
                },
            });
            // const array = [
            //     46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57,
            //     62, 11, 36, 20, 34, 44, 52,
            // ];
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
            // await got(`https://space.bilibili.com/${uid}/`, {
            //     headers: {
            //         Referer: 'https://www.bilibili.com/',
            //         Cookie: cookie,
            //     },
            // });
            const params = utils.addVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, verifyString);
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?${params}`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            return nameResponse.data ? nameResponse.data.name : undefined;
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
            // await got(`https://space.bilibili.com/${uid}/`, {
            //     headers: {
            //         Referer: `https://www.bilibili.com/`,
            //         Cookie: cookie,
            //     },
            // });
            const params = utils.addVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, verifyString);
            const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?${params}`, {
                headers: {
                    Referer: `https://space.bilibili.com/${uid}/`,
                    Cookie: cookie,
                },
            });
            if (nameResponse.data.name) {
                name = nameResponse.data.name;
                face = nameResponse.data.face;
            } else {
                logger.error(`Error when visiting /x/space/wbi/acc/info: ${JSON.stringify(nameResponse)}`);
            }
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
    getArticleDataFromCvid: async (ctx, cvid, uid) => {
        const url = `https://www.bilibili.com/read/cv${cvid}`;
        const data = await ctx.cache.tryGet(
            url,
            async () =>
                (
                    await got({
                        method: 'get',
                        url,
                        headers: {
                            Referer: `https://space.bilibili.com/${uid}/`,
                        },
                    })
                ).data
        );
        const $ = cheerio.load(data);
        const description = $('#read-article-holder').html();
        return { url, description };
    },
};
