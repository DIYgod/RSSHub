const { resolve } = require('url');
const cheerio = require('cheerio');
const got = require('@/utils/got');
const config = require('@/config').value;
const parseTorrent = require('parse-torrent');

const getCookie = async (username, password, cache) => {
    const login_url = 'https://nhentai.net/login/';
    const cache_key = 'nhentai-cookie';

    const cached_cookie = await cache.get(cache_key);
    if (cached_cookie) {
        const { cookie, time } = JSON.parse(cached_cookie);
        const now = new Date().getTime();
        if (now - time < 86400 * 3 * 1000) {
            // 不考虑缓存过期的话，有效期最多允许3天
            return cookie;
        }
    }

    const { data, headers } = await got.get(login_url);
    const csrf_token_middleware = data.match(/name="csrfmiddlewaretoken" value="(.*?)"/)[1];
    const csrf_token_cookie = headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    const login = await got({
        method: 'post',
        url: login_url,
        headers: {
            referer: login_url,
            cookie: csrf_token_cookie,
        },
        form: {
            csrfmiddlewaretoken: csrf_token_middleware,
            username_or_email: username,
            password,
            next: '',
        },
        followRedirect: false,
    });

    if (login.statusCode !== 302) {
        cache.set(
            cache_key,
            JSON.stringify({
                cookie: '',
                time: new Date().getTime(),
            })
        );
        return '';
    }

    const user_token_cookie = login.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ');

    cache.set(
        cache_key,
        JSON.stringify({
            cookie: user_token_cookie,
            time: new Date().getTime(),
        })
    );

    return user_token_cookie;
};

exports.getSimple = async (url) => {
    const { data } = await got.get(url);
    const $ = cheerio.load(data);

    return $('.gallery a.cover')
        .map((_, ele) => parseSimpleDetail($(ele)))
        .toArray();
};

const MAX_DETAIL = 5;
exports.getDetails = (cache, simples) => Promise.all(simples.slice(0, MAX_DETAIL).map((simple) => cache.tryGet(simple.link, () => getDetail(simple))));

const MAX_TORRENT = 5;
exports.getTorrents = async (cache, simples) => {
    if (!config.nhentai || !config.nhentai.username || !config.nhentai.password) {
        throw 'nhentai RSS with torrents is disabled due to the lack of <a href="https://docs.rsshub.app/install/#bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>';
    }
    const cookie = await getCookie(config.nhentai.username, config.nhentai.password, cache);
    if (!cookie) {
        throw 'Invalid username (or email) or password for nhentai torrent download';
    }
    return getTorrentWithCookie(cache, simples, cookie);
};
const getTorrentWithCookie = (cache, simples, cookie) => Promise.all(simples.slice(0, MAX_TORRENT).map((simple) => cache.tryGet(simple.link + 'download', () => getTorrent(simple, cookie))));

const parseSimpleDetail = ($ele) => {
    const link = resolve('https://nhentai.net', $ele.attr('href'));
    const thumb = $ele.children('img');
    const thumbSrc = thumb.attr('data-src') || thumb.attr('src');
    const highResoThumbSrc = thumbSrc.replace('thumb', '1').replace(/t\d+\.nhentai\.net/, 'i.nhentai.net');
    return {
        title: $ele.children('.caption').text(),
        link,
        pubDate: new Date().toUTCString(), // 要获得准确时间需要对每个本子都请求一遍，很麻烦
        description: `<img src="${highResoThumbSrc}" />`,
    };
};

const getTorrent = async (simple, cookie) => {
    const { link } = simple;
    const response = await got.get(link + 'download', { followRedirect: false, responseType: 'buffer', headers: { Cookie: cookie } });
    const info = parseTorrent(response.data);
    const uri = info ? parseTorrent.toMagnetURI(info) : '';
    return {
        ...simple,
        enclosure_url: uri,
        enclosure_type: 'application/x-bittorrent',
    };
};

const getDetail = async (simple) => {
    const { link } = simple;
    const { data } = await got.get(link);
    const $ = cheerio.load(data);

    const galleryImgs = $('.gallerythumb img')
        .map((_, ele) => resolve('https://nhentai.net', $(ele).attr('data-src')))
        .get()
        .map((src) => src.replace(/(.+)(\d+)t\.(.+)/, (_, p1, p2, p3) => `${p1}${p2}.${p3}`)) // thumb to high-quality
        .map((src) => src.replace(/t\d+\.nhentai\.net/, 'i.nhentai.net'));

    const renderImg = (src) => `<img src="${src}" /><br />`;
    return {
        ...simple,
        title: $('div#info > h2').text() || $('div#info > h1').text(),
        pubDate: new Date($('time').attr('datetime')).toUTCString(),
        description: `
            <h1>${galleryImgs.length} pages</h1>
            ${galleryImgs.map(renderImg).join('')}
        `.trim(),
    };
};
