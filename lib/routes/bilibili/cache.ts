import { load } from 'cheerio';
import { FetchError } from 'ofetch';
import { RateLimiterMemory, RateLimiterQueue } from 'rate-limiter-flexible';

import { config } from '@/config';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { isWorker } from '@/utils/is-worker';
import logger from '@/utils/logger';
import { getPlaywrightPage } from '@/utils/playwright';

import utils from './utils';

const subtitleLimiter = new RateLimiterMemory({
    points: 5,
    duration: 1,
    execEvenly: true,
});

const subtitleLimiterQueue = new RateLimiterQueue(subtitleLimiter, {
    maxQueueSize: 4800,
});

const getConfiguredCookie = () => {
    if (Object.keys(config.bilibili.cookies).length === 0) {
        return;
    }

    // Update b_lsid in cookies
    for (const key of Object.keys(config.bilibili.cookies)) {
        const cookie = config.bilibili.cookies[key];
        if (!cookie) {
            continue;
        }
        const updatedCookie = cookie.replace(/b_lsid=[0-9A-F]+_[0-9A-F]+/, () => `b_lsid=${utils.lsid()}`);
        config.bilibili.cookies[key] = updatedCookie;
    }

    return config.bilibili.cookies[Object.keys(config.bilibili.cookies)[Math.floor(Math.random() * Object.keys(config.bilibili.cookies).length)]] || '';
};

let anonymousCookiePromise: Promise<string> | undefined;

const getCookie = (disableConfig = false) => {
    const configuredCookie = disableConfig ? undefined : getConfiguredCookie();
    if (configuredCookie !== undefined) {
        return configuredCookie;
    }

    if (anonymousCookiePromise) {
        return anonymousCookiePromise;
    }
    anonymousCookiePromise = fetchAnonymousCookie();
    return anonymousCookiePromise;
};

async function fetchAnonymousCookie() {
    try {
        try {
            return await getVisitorCookie();
        } catch (error) {
            logger.warn(`Failed to build a Bilibili visitor cookie, falling back to Playwright: ${error}`);
        }
        return await cache.tryGet<string>(
            'bili-cookie',
            async () => {
                const url = 'https://space.bilibili.com/1/dynamic';
                const timeout = 12000;
                const { page, destroy } = await getPlaywrightPage(url, {
                    noGoto: true,
                    closeTimeout: 0,
                });
                try {
                    await page.route('**/*', (route) => {
                        if (['document', 'script', 'xhr', 'fetch'].includes(route.request().resourceType())) {
                            return route.continue();
                        }
                        return route.abort();
                    });
                    const [response] = await Promise.all([
                        page.waitForResponse((response) => response.url() === 'https://api.bilibili.com/x/web-interface/nav', { timeout }),
                        page.goto(url, { waitUntil: 'domcontentloaded', timeout }),
                    ]);
                    if (!response.ok()) {
                        throw new Error(`Bilibili anonymous session request failed with HTTP ${response.status()}`);
                    }
                    const cookies = await page.context().cookies();
                    const cookieString = cookies
                        .map((cookie) => `${cookie.name}=${cookie.value}`)
                        .join('; ')
                        .replace(/b_lsid=[0-9A-F]+_[0-9A-F]+/, () => `b_lsid=${utils.lsid()}`);
                    logger.debug(`Initialized Bilibili anonymous session with ${cookies.length} cookies`);
                    return cookieString;
                } finally {
                    await destroy();
                }
            },
            undefined,
            false
        );
    } finally {
        anonymousCookiePromise = undefined;
    }
}

// An anonymous visitor cookie made the way the web page makes one, without a browser: buvid3 and
// buvid4 from the fingerprint endpoint and a bili_ticket from the ticket endpoint. The risk control
// of the video list API lets it through far more often than buvid3 alone, while space.bilibili.com
// now answers plain requests and fresh browsers with a 412 proof-of-work challenge.
const getVisitorCookie = async () => {
    const key = 'bili-visitor-cookie:v2';
    const cached = await cache.get(key, false);
    if (cached) {
        return cached;
    }

    const { data: fingerResponse } = await got('https://api.bilibili.com/x/frontend/finger/spi', {
        headers: {
            Referer: 'https://www.bilibili.com/',
        },
    });
    const { b_3: buvid3, b_4: buvid4 } = fingerResponse.data;
    const now = Math.floor(Date.now() / 1000);
    const cookies = [`buvid3=${buvid3}`, `buvid4=${encodeURIComponent(buvid4)}`, `b_nut=${now}`, `_uuid=${utils._uuid()}`, `b_lsid=${utils.lsid()}`, `buvid_fp=${crypto.randomUUID().replaceAll('-', '')}`];
    let ttl = Math.min(config.cache.contentExpire, 300);

    try {
        const { data: ticketResponse } = await got.post(`https://api.bilibili.com/bapis/bilibili.api.ticket.v1.Ticket/GenWebTicket?key_id=ec02&hexsign=${utils.hexsign(now)}&context[ts]=${now}&csrf=`, {
            headers: {
                Referer: 'https://www.bilibili.com/',
            },
        });
        const ticket = ticketResponse.data?.ticket;
        if (ticket) {
            const expires = Number(ticketResponse.data.created_at ?? now) + Number(ticketResponse.data.ttl ?? 3 * 24 * 60 * 60);
            const remaining = Math.floor(expires - Date.now() / 1000);
            if (Number.isFinite(remaining) && remaining > 0) {
                cookies.push(`bili_ticket=${ticket}`, `bili_ticket_expires=${expires}`);
                ttl = Math.min(config.cache.contentExpire, remaining);
            }
        }
    } catch (error) {
        logger.warn(`Failed to get a Bilibili web ticket for the visitor cookie: ${error}`);
    }

    const cookie = cookies.join('; ');
    if (ttl > 0) {
        await cache.set(key, cookie, ttl);
    }
    return cookie;
};

const getWbiVerifyString = () => {
    const key = 'bili-wbi-verify-string';
    return cache.tryGet(key, async () => {
        const cookie = getConfiguredCookie() ?? (await getVisitorCookie());
        const { data: navResponse } = await got('https://api.bilibili.com/x/web-interface/nav', {
            headers: {
                Referer: 'https://www.bilibili.com/',
                Cookie: cookie,
            },
        });
        const imgUrl = navResponse.data.wbi_img.img_url;
        const subUrl = navResponse.data.wbi_img.sub_url;
        const r = imgUrl.slice(imgUrl.lastIndexOf('/') + 1).split('.', 1)[0] + subUrl.slice(subUrl.lastIndexOf('/') + 1).split('.', 1)[0];
        const array = [
            46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62,
            11, 36, 20, 34, 44, 52,
        ];
        const o: any[] = [];
        for (const t of array) {
            if (r.charAt(t)) {
                o.push(r.charAt(t));
            }
        }
        return o.join('').slice(0, 32);
    });
};

const getPublicUserCard = (uid) =>
    cache.tryGet<{ name: string; face: string }>(`bili-user-card-from-uid-${uid}`, async () => {
        const { data: response } = await got(`https://api.bilibili.com/x/web-interface/card?mid=${uid}`, {
            headers: {
                Referer: `https://space.bilibili.com/${uid}/`,
            },
        });
        if (response.code !== 0 || !response.data?.card?.name) {
            throw new Error(`Bilibili public profile request failed: code = ${response.code}, message = ${response.message}`);
        }
        return response.data.card;
    });

const getUsernameFromUID = async (uid) => (await getPublicUserCard(uid)).name;

const getUsernameAndFaceFromUID = async (uid) => {
    const card = await getPublicUserCard(uid);
    return [card.name, card.face];
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

const getUserInfoFromLiveID = (liveID) => {
    const key = `bili-userinfo-from-liveID-${liveID}`;
    return cache.tryGet(key, async () => {
        const { data: nameResponse } = await got(`https://api.live.bilibili.com/live_user/v1/UserInfo/get_anchor_in_room?roomid=${liveID}`, {
            headers: {
                Referer: `https://live.bilibili.com/${liveID}`,
            },
        });
        return nameResponse.data.info;
    });
};

const getVideoNameFromId = (aid, bvid) => {
    const key = `bili-videoname-from-id-${bvid || aid}`;
    return cache.tryGet(key, async () => {
        try {
            const cookie = await getCookie();
            const { data } = await got('https://api.bilibili.com/x/web-interface/view', {
                searchParams: {
                    aid: aid || undefined,
                    bvid: bvid || undefined,
                },
                headers: {
                    Referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
                    Cookie: cookie,
                },
            });
            return data.data.title;
        } catch (error) {
            if (!(error instanceof FetchError) || error.response?.status !== 412 || !(await getCidFromId(aid, 1, bvid))) {
                throw error;
            }
            // Keep an explicit video identifier when the title endpoint blocks anonymous access.
            return bvid || `av${aid}`;
        }
    });
};

const getCidFromId = (aid, pid, bvid) => {
    const key = `bili-cid-from-id-${bvid || aid}-${pid}`;
    return cache.tryGet(key, async () => {
        const cookie = await getCookie();
        const { data } = await got(`https://api.bilibili.com/x/player/pagelist?${bvid ? `bvid=${bvid}` : `aid=${aid}`}`, {
            headers: {
                Referer: `https://www.bilibili.com/video/${bvid || `av${aid}`}`,
                Cookie: cookie,
            },
        });
        if (data.code !== 0) {
            throw new Error(`Bilibili page list request failed: code = ${data.code}, message = ${data.message}`);
        }
        return data.data?.[pid - 1]?.cid;
    });
};

interface SubtitleEntry {
    from: number;
    to: number;
    sid: number;
    content: string;
    music: number;
}

function secondsToSrtTime(seconds: number): string {
    const date = new Date(seconds * 1000);
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
}

function convertJsonToSrt(body: SubtitleEntry[]): string {
    return body
        .map((item, index) => {
            const start = secondsToSrtTime(item.from);
            const end = secondsToSrtTime(item.to);
            return `${index + 1}\n${start} --> ${end}\n${item.content}\n`;
        })
        .join('\n');
}

const getVideoSubtitle = async (
    bvid: string
): Promise<
    Array<{
        content: string;
        lan_doc: string;
    }>
> => {
    // Workers skip subtitle metadata and downloads, regardless of route configuration.
    if (isWorker || !bvid) {
        return [];
    }

    const cid = await getCidFromId(undefined, 1, bvid);
    if (!cid) {
        return [];
    }

    return cache.tryGet(`bili-video-subtitle-${bvid}`, async () => {
        await subtitleLimiterQueue.removeTokens(1);

        const getSubtitleData = async (cookie: string) => {
            const response = await got(`https://api.bilibili.com/x/player/wbi/v2?bvid=${bvid}&cid=${cid}`, {
                headers: {
                    Referer: `https://www.bilibili.com/video/${bvid}`,
                    Cookie: cookie,
                },
            });
            return response;
        };

        const cookie = await getCookie();
        const response = await getSubtitleData(cookie);
        const subtitles = response?.data?.data?.subtitle?.subtitles || [];

        return await Promise.all(
            subtitles.map(async (subtitle) => {
                const url = `https:${subtitle.subtitle_url}`;
                const subtitleData = await cache.tryGet(url, async () => {
                    const subtitleResponse = await got(url);
                    return convertJsonToSrt(subtitleResponse?.data?.body || []);
                });
                return {
                    content: subtitleData,
                    lan_doc: subtitle.lan_doc,
                };
            })
        );
    });
};

const getVideoSubtitleAttachment = async (bvid: string) => {
    const subtitles = await getVideoSubtitle(bvid);
    return subtitles.map((subtitle) => ({
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(subtitle.content)}`,
        mime_type: 'text/srt',
        title: `字幕 - ${subtitle.lan_doc}`,
    }));
};

const getAidFromBvid = async (bvid) => {
    const key = `bili-cid-from-bvid-${bvid}`;
    let aid = await cache.get(key);
    if (!aid) {
        const cookie = await getCookie();
        const response = await got(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
            headers: {
                Referer: `https://www.bilibili.com/video/${bvid}`,
                Cookie: cookie,
            },
        });
        if (response.data && response.data.data && response.data.data.aid) {
            aid = response.data.data.aid;
        }
        cache.set(key, aid ?? '');
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
                    .match(/window\.__INITIAL_STATE__\s*=\s*(\S.*?)?;\(/)![1]
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
                    } else if (element.para_type === 2) {
                        for (const image of element.pic.pics) {
                            description += `<p ><img src="${image.url}@progressive.webp"></p>`;
                        }
                    } else if (element.para_type === 3 && element.line?.pic?.url) {
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
    getConfiguredCookie,
    getVisitorCookie,
    getWbiVerifyString,
    getUsernameFromUID,
    getUsernameAndFaceFromUID,
    getLiveIDFromShortID,
    getUserInfoFromLiveID,
    getVideoNameFromId,
    getCidFromId,
    getAidFromBvid,
    getArticleDataFromCvid,
    getVideoSubtitle,
    getVideoSubtitleAttachment,
};
