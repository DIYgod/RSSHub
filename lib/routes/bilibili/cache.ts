import cache from '@/utils/cache';
import got from '@/utils/got';
import utils from './utils';
import { load } from 'cheerio';
import { config } from '@/config';
import logger from '@/utils/logger';

const getCookie = () => {
    if (Object.keys(config.bilibili.cookies).length > 0) {
        return config.bilibili.cookies[Object.keys(config.bilibili.cookies)[Math.floor(Math.random() * Object.keys(config.bilibili.cookies).length)]];
    }
    const key = 'bili-cookie';
    return cache.tryGet(key, async () => {
        // default Referer: https://www.bilibili.com is limited
        // Bilibili return cookies with multiple set-cookie
        // let response = await got('https://space.bilibili.com/1');
        // const setCookie = response.headers['set-cookie']; // should contain buvid3 and b_nut
        // if (typeof setCookie === 'undefined') {
        //     return '';
        // }
        // const cookie = setCookie.map((cookie) => cookie.split(';')[0]);
        const cookie = [];
        cookie.push(['b_lsid', utils.lsid()].join('='), ['_uuid', utils._uuid()].join('='), ['b_nut', Date.now().toString()].join('='));
        let response = await got('https://api.bilibili.com/x/frontend/finger/spi', {
            headers: {
                Referer: 'https://www.bilibili.com/',
                Cookie: cookie.join('; '),
            },
        });
        cookie.push(['buvid3', encodeURIComponent(response.data.data.b_3)].join('='), ['bvuid4', encodeURIComponent(response.data.data.b_4)].join('='));
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
            cookie.push(['bili_ticket', response.data.data.ticket].join('='), ['bili_ticket_expires', (Number.parseInt(response.data.data.created_at) + Number.parseInt(response.data.data.ttl)).toString()].join('='));
        } catch {
            // HTTPError: Response code 429 (Too Many Requests)
        }

        return cookie.join('; ');
    });
};

const getWbiVerifyString = () => {
    const key = 'bili-wbi-verify-string';
    return cache.tryGet(key, async () => {
        const cookie = await getCookie();
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
        const array = JSON.parse(jsResponse.match(/\[(?:\d+,){63}\d+]/));
        const o = [];
        for (const t of array) {
            r.charAt(t) && o.push(r.charAt(t));
        }
        return o.join('').slice(0, 32);
    });
};

const getUsernameFromUID = (uid) => {
    const key = 'bili-username-from-uid-' + uid;
    return cache.tryGet(key, async () => {
        const cookie = await getCookie();
        const wbiVerifyString = await getWbiVerifyString();
        // await got(`https://space.bilibili.com/${uid}/`, {
        //     headers: {
        //         Referer: 'https://www.bilibili.com/',
        //         Cookie: cookie,
        //     },
        // });
        const params = utils.addWbiVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, wbiVerifyString);
        const { data: nameResponse } = await got(`https://api.bilibili.com/x/space/wbi/acc/info?${params}`, {
            headers: {
                Referer: `https://space.bilibili.com/${uid}/`,
                Cookie: cookie,
            },
        });
        return nameResponse.data ? nameResponse.data.name : undefined;
    });
};

const getUsernameAndFaceFromUID = async (uid) => {
    const nameKey = 'bili-username-from-uid-' + uid;
    const faceKey = 'bili-userface-from-uid-' + uid;
    let name = await cache.get(nameKey);
    let face = await cache.get(faceKey);
    if (!name || !face) {
        const cookie = await getCookie();
        const wbiVerifyString = await getWbiVerifyString();
        // await got(`https://space.bilibili.com/${uid}/`, {
        //     headers: {
        //         Referer: `https://www.bilibili.com/`,
        //         Cookie: cookie,
        //     },
        // });
        const params = utils.addWbiVerifyInfo(`mid=${uid}&token=&platform=web&web_location=1550101`, wbiVerifyString);
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
        cache.set(nameKey, name);
        cache.set(faceKey, face);
    }
    return [name, face];
};

const getLiveIDFromShortID = (shortID) => {
    const key = `bili-liveID-from-shortID-${shortID}`;
    return cache.tryGet(key, async () => {
        const { data: liveIDResponse } = await got(`https://api.live.bilibili.com/room/v1/Room/room_init?id=${shortID}`, {
            headers: {
                Referer: `https://live.bilibili.com/${shortID}`,
            },
        });
        return liveIDResponse.data.room_id;
    });
};

const getUsernameFromLiveID = (liveID) => {
    const key = `bili-username-from-liveID-${liveID}`;
    return cache.tryGet(key, async () => {
        const { data: nameResponse } = await got(`https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`, {
            headers: {
                Referer: `https://live.bilibili.com/${liveID}`,
            },
        });
        return nameResponse.data.info.uname;
    });
};

const getVideoNameFromId = (aid, bvid) => {
    const key = `bili-videoname-from-id-${bvid || aid}`;
    return cache.tryGet(key, async () => {
        const { data } = await got(`https://api.bilibili.com/x/web-interface/view`, {
            searchParams: {
                aid: aid || undefined,
                bvid: bvid || undefined,
            },
            referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
        });
        return data.data.title;
    });
};

const getCidFromId = (aid, pid, bvid) => {
    const key = `bili-cid-from-id-${bvid || aid}-${pid}`;
    return cache.tryGet(key, async () => {
        const { data } = await got(`https://api.bilibili.com/x/web-interface/view?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`, {
            referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
        });
        return data.data.pages[pid - 1].cid;
    });
};

const getAidFromBvid = async (bvid) => {
    const key = `bili-cid-from-bvid-${bvid}`;
    let aid = await cache.get(key);
    if (!aid) {
        const response = await got(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
            headers: {
                Referer: `https://www.bilibili.com/video/${bvid}`,
            },
        });
        if (response.data && response.data.data && response.data.data.aid) {
            aid = response.data.data.aid;
        }
        cache.set(key, aid);
    }
    return aid;
};

const getArticleDataFromCvid = async (cvid, uid) => {
    const url = `https://www.bilibili.com/read/cv${cvid}/`;
    const data = await cache.tryGet(
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
    const $ = load(data);
    let description = $('#read-article-holder').html();
    if (!description) {
        try {
            const newFormatData = JSON.parse(
                $('script:contains("window.__INITIAL_STATE__")')
                    .text()
                    .match(/window\.__INITIAL_STATE__\s*=\s*(.*?);\(/)[1]
            );

            if (newFormatData?.readInfo?.opus?.content?.paragraphs) {
                description = '';
                for (const element of newFormatData.readInfo.opus.content.paragraphs) {
                    if (element.para_type === 1) {
                        for (const text of element.text.nodes) {
                            if (text?.word?.words) {
                                description += `<p>${text.word.words}</p>`;
                            }
                        }
                    }
                    if (element.para_type === 2) {
                        for (const image of element.pic.pics) {
                            description += `<p ><img src="${image.url}@progressive.webp"></p>`;
                        }
                    }
                    if (element.para_type === 3 && element.line?.pic?.url) {
                        description += `<figure><img src="${element.line.pic.url}"></figure>`;
                    }
                }
            }
        } catch {
            /* empty */
        }
    }
    return { url, description };
};

export default {
    getCookie,
    getWbiVerifyString,
    getUsernameFromUID,
    getUsernameAndFaceFromUID,
    getLiveIDFromShortID,
    getUsernameFromLiveID,
    getVideoNameFromId,
    getCidFromId,
    getAidFromBvid,
    getArticleDataFromCvid,
};
