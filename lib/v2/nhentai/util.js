const cheerio = require('cheerio');
const got = require('@/utils/got');
const config = require('@/config').value;
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const baseUrl = 'https://nhentai.net';

const getCookie = async (username, password, cache) => {
    const loginUrl = 'https://nhentai.net/login/';
    const cacheKey = 'nhentai:cookie';

    const cachedCookie = await cache.get(cacheKey);
    if (cachedCookie) {
        const { cookie, time } = JSON.parse(cachedCookie);
        const now = new Date().getTime();
        if (now - time < 86400 * 3 * 1000) {
            // 不考虑缓存过期的话，有效期最多允许3天
            return cookie;
        }
    }

    const { data, headers } = await got(loginUrl);
    const csrfTokenMiddleware = data.match(/name="csrfmiddlewaretoken" value="(.*?)"/)[1];
    const csrfTokenCookie = headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    const login = await got.post(loginUrl, {
        headers: {
            referer: loginUrl,
            cookie: csrfTokenCookie,
        },
        form: {
            csrfmiddlewaretoken: csrfTokenMiddleware,
            username_or_email: username,
            password,
            next: '',
        },
        followRedirect: false,
    });

    if (login.statusCode !== 302) {
        cache.set(
            cacheKey,
            JSON.stringify({
                cookie: '',
                time: new Date().getTime(),
            })
        );
        return '';
    }

    const userTokenCookie = login.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    cache.set(
        cacheKey,
        JSON.stringify({
            cookie: userTokenCookie,
            time: new Date().getTime(),
        })
    );

    return userTokenCookie;
};

const gotByIp = (url, ...options) =>
    // credit: https://github.com/sinkaroid/jandapress/pull/23
    got(url.replace(/^https:\/\/nhentai.net\//, 'http://129.150.63.211:3002/'), {
        ...options,
        headers: {
            host: 'nhentai.net',
        },
    });

const getSimple = async (url) => {
    const { data } = await gotByIp(url);
    const $ = cheerio.load(data);

    return $('.gallery a.cover')
        .toArray()
        .map((ele) => parseSimpleDetail($(ele)));
};

const getDetails = (cache, simples, limit) => Promise.all(simples.slice(0, limit).map((simple) => cache.tryGet(simple.link, () => getDetail(simple))));

const getTorrents = async (cache, simples, limit) => {
    if (!config.nhentai || !config.nhentai.username || !config.nhentai.password) {
        throw Error('nhentai RSS with torrents is disabled due to the lack of <a href="https://docs.rsshub.app/en/install/#configuration-route-specific-configurations">relevant config</a>');
    }
    const cookie = await getCookie(config.nhentai.username, config.nhentai.password, cache);
    if (!cookie) {
        throw Error('Invalid username (or email) or password for nhentai torrent download');
    }
    return getTorrentWithCookie(cache, simples, cookie, limit);
};
const getTorrentWithCookie = (cache, simples, cookie, limit) => Promise.all(simples.slice(0, limit).map((simple) => cache.tryGet(simple.link + 'download', () => getTorrent(simple, cookie))));

const parseSimpleDetail = ($ele) => {
    const link = new URL($ele.attr('href'), baseUrl).href;
    const thumb = $ele.children('img');
    const thumbSrc = thumb.attr('data-src') || thumb.attr('src');
    const highResoThumbSrc = thumbSrc.replace('thumb', '1').replace(/t(\d+)\.nhentai\.net/, 'i$1.nhentai.net');
    return {
        title: $ele.children('.caption').text(),
        link,
        description: `<img src="${highResoThumbSrc}">`,
    };
};

const getTorrent = async (simple, cookie) => {
    const { link } = simple;
    const response = await gotByIp(link + 'download', { followRedirect: false, responseType: 'buffer', headers: { Cookie: cookie } });
    return {
        ...simple,
        enclosure_url: response.data,
        enclosure_type: 'application/x-bittorrent',
    };
};

const getDetail = async (simple) => {
    const { link } = simple;
    const { data } = await gotByIp(link);
    const $ = cheerio.load(data);

    const galleryImgs = $('.gallerythumb img')
        .toArray()
        .map((ele) => new URL($(ele).attr('data-src'), baseUrl).href)
        .map((src) => src.replace(/(.+)(\d+)t\.(.+)/, (_, p1, p2, p3) => `${p1}${p2}.${p3}`)) // thumb to high-quality
        .map((src) => src.replace(/t(\d+)\.nhentai\.net/, 'i$1.nhentai.net'));

    return {
        ...simple,
        title: $('div#info > h2').text() || $('div#info > h1').text(),
        pubDate: parseDate($('time').attr('datetime')),
        description: art(path.join(__dirname, 'templates/desc.art'), {
            length: galleryImgs.length,
            images: galleryImgs,
        }),
    };
};

module.exports = {
    baseUrl,
    getSimple,
    getDetails,
    getTorrents,
};
