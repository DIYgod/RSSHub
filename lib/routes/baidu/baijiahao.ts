import { createCipheriv, createHash, randomUUID } from 'node:crypto';

import { load } from 'cheerio';
import type { Context } from 'hono';

import { config } from '@/config';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import { generateHeaders, PRESETS } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const abdrKey = 'F617E80F5BD64F5A';
const abdrIv = '636014d173e04409';
const abdrKeyId = 'a148fdf866c24529';

const fingerprint = {
    1: '1', // canvas 2d support
    4: '30', // screen.colorDepth
    5: '1512x982', // screen size
    6: '1512x944', // available screen size
    7: ',', // screen.deviceXDPI, deviceYDPI, old IE only
    8: ['PDF Viewer', 'Chrome PDF Viewer', 'Chromium PDF Viewer', 'Microsoft Edge PDF Viewer', 'WebKit built-in PDF'].map((name) => encodeURIComponent(name)).join(','), // navigator.plugins names
    9: ['Portable Document Format', 'Portable Document Format'].map((description) => encodeURIComponent(description)).join(','), // navigator.mimeTypes descriptions
    11: '1', // localStorage available
    12: '1', // sessionStorage available
    13: 'true', // navigator.cookieEnabled
    14: '0', // Date#getTimezoneOffset
    15: 'en-US', // navigator.language
    16: '', // navigator.systemLanguage, old IE only
    17: '1,0,1,1,1,1', // video.canPlayType for theora, h264, vp8, vp9 and hls
    18: '2', // window.devicePixelRatio
    19: '8', // navigator.hardwareConcurrency
    20: '0', // ad blocker, whether an .adsbox div gets hidden
    21: '', // navigator.doNotTrack
    22: 'Gecko,20030107,Google Inc.,,Mozilla,Netscape,MacIntel', // navigator product, productSub, vendor, vendorSub, appCodeName, appName, platform
    23: '0,0,0', // navigator maxTouchPoints, msMaxTouchPoints, touch event support
    24: '1', // indexedDB available
    28: 'false,false', // legacy engine tells: document.getBoxObjectFor, window.opera
    29: 'true,true,true', // eval tamper check: no prototype, name is eval, toString says native code
    30: 0, // document.body.addBehavior, old IE only
    31: 8, // navigator.deviceMemory
    32: '31', // milliseconds the collection took
    34: 'MacIntel', // navigator.platform
    35: 'false,true', // navigator.battery present, navigator.getBattery present
    41: true, // battery charging
    42: 0, // battery chargingTime
    43: null, // battery dischargingTime
    44: 1, // battery level
    60: false, // PhantomJS globals
    61: false, // Selenium attributes on the document element
    62: false, // other automation globals
    63: true, // 'webdriver' in navigator
    64: false, // navigator.webdriver
    65: true, // window.chrome present
    69: 0, // whether navigator.webdriver is a patched property
    70: 0, // whether any automation check above fired
    71: '', // name of the automation check that fired
    72: 'en-US,en', // navigator.languages
    79: '0,0,0,0,0', // spoof checks on plugins, screen size, cores and platform
    80: '0,0,0,0,0', // native code toString checks on canvas and friends
    81: '0', // whether the document.cookie getter is patched
    106: 2041, // script build id
    107: '2.9.17', // script version
    112: '', // __abbaidu_ globals left by earlier visits
    113: '', // __abbaidu_ globals left by earlier visits
    114: '', // __abbaidu_ globals left by earlier visits
    115: '', // __abbaidu_ globals left by earlier visits
    198: 33, // eval.toString().length
    199: '', // navigator.cpuClass, old IE only
    200: '1', // constant
};

const sha1 = () => createHash('sha1').update(randomUUID()).digest('hex');

export const route: Route = {
    path: '/baijiahao/:id/:tab?',
    categories: ['new-media'],
    example: '/baidu/baijiahao/3617',
    parameters: {
        id: 'Account id, the `app_id` in the URL of the author page',
        tab: {
            description: 'Content type',
            options: [
                { value: 'main', label: '全部' },
                { value: 'article', label: '文章' },
                { value: 'dynamic', label: '动态' },
            ],
            default: 'main',
        },
    },
    name: '百家号',
    maintainers: ['TonyRL'],
    handler,
    url: 'baijiahao.baidu.com',
};

async function handler(ctx: Context) {
    const { id, tab = 'main' } = ctx.req.param();
    const limit = ctx.req.query('limit') ?? 20;
    const link = `https://baijiahao.baidu.com/u?app_id=${id}`;

    const page = await ofetch(link, { headerGeneratorOptions: PRESETS.MODERN_IOS });
    const { user } = JSON.parse(page.match(/window\.runtime= (\{.*?\}),window\.runtime\.pageType/)[1]);

    const abSr = await cache.tryGet(
        'baidu:baijiahao:ab_sr',
        async () => {
            const { 'user-agent': ua } = generateHeaders(PRESETS.MODERN_MACOS_CHROME);
            const cipher = createCipheriv('aes-128-cbc', abdrKey, abdrIv);
            const plaintext = JSON.stringify({
                ...fingerprint,
                3: sha1(), // sha1 of the canvas rendering
                25: `Google Inc. (Apple),ANGLE (Apple, ANGLE Metal Renderer: Apple M${Math.ceil(Math.random() * 6)}, Unspecified Version)`, // WebGL unmasked vendor and renderer
                27: ua, // navigator.userAgent
                78: `${sha1()}_${sha1()}`, // composite hash of canvas, plugins, cores, WebGL and platform
                82: sha1(), // hash of a sample of the page script text
                85: sha1(), // hash of fields 78, 101, 103 and 82
                101: sha1(), // per visit id: URL, referrer, user agent, start time and a random value, hashed
                103: String(Date.now()),
                108: link, // page URL
                109: '', // document.referrer
            });
            const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]).toString('hex');

            const response = await ofetch.raw('https://miao.baidu.com/abdr', {
                method: 'POST',
                body: Buffer.from(JSON.stringify({ data, key_id: abdrKeyId })).toString('base64'),
                headers: {
                    'content-type': 'text/plain;charset=UTF-8',
                    origin: 'https://baijiahao.baidu.com',
                    'user-agent': ua,
                },
            });
            return response.headers.get('ab-sr');
        },
        config.cache.routeExpire,
        false
    );

    const { data } = await ofetch('https://mbd.baidu.com/webpage', {
        query: {
            tab,
            num: limit,
            uk: user.uk,
            source: 'pc',
            type: 'newhome',
            action: 'dynamic',
            format: 'json',
        },
        headers: {
            cookie: `ab_sr=${abSr}`,
            referer: 'https://baijiahao.baidu.com/',
        },
    });

    const list = data.list
        .filter((item) => item.itemData.url)
        .map((item) => {
            const { title, url, imgSrc, vertical_cover: cover, rmb_videoInfoExt: videoInfo } = item.itemData;
            const images = [imgSrc ?? cover ?? []].flat().map((image) => (typeof image === 'string' ? image : image.src));
            const video = videoInfo ? JSON.parse(videoInfo) : undefined;
            const quality = video && ['1080p', 'sc', 'hd', 'default', '360p'].find((name) => video[name]);
            const source = quality && (video[quality][`${quality}UrlHttps`] ?? video[quality][`${quality}UrlHttp`])?.replace('http://', 'https://');
            return {
                title,
                link: url,
                author: user.nickname,
                pubDate: parseDate(item.dynamic_ctime, 'X'),
                description: [source ? `<video src="${source}" poster="${images[0]}" controls preload="metadata"></video>` : images.map((image) => `<img src="${image}">`).join(''), title.replaceAll('\n', '<br>')].join(''),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            item.link.startsWith('https://baijiahao.baidu.com/s?')
                ? cache.tryGet(item.link, async () => {
                      const detail = await ofetch(item.link);
                      const $ = load(detail);
                      item.description = $('[data-testid=article]').html();
                      return item;
                  })
                : item
        )
    );

    return {
        title: `${user.nickname} - 百家号`,
        description: user.sign,
        link,
        image: user.avatar,
        item: items,
    };
}
