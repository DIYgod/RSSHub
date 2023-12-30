const { parseDate } = require('@/utils/parse-date');
const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'http://www.kcna.kp';

const parseJucheDate = (dateString) => {
    if (!dateString) {
        return null;
    }

    // https://en.wikipedia.org/wiki/Juche_calendar
    const dateMatch = dateString.match(/(\d+)\D(\d+)\D(\d+)/);
    const [jucheYear, month, day] = dateMatch ? dateMatch.slice(1) : [null, null, null];
    if (jucheYear && month && day) {
        const year = parseInt(jucheYear, 10) + 1911;
        return parseDate(`${year}-${month}-${day}`, 'YYYY-M-D');
    }
    return null;
};

const fixDesc = ($, elem) => {
    // <nobr><span className='fSpecCs'>???</span></nobr> => <b>???</b>
    const $elem = $(elem);
    $elem.find('.fSpecCs').each((_, item) => {
        if (item.parent.name === 'nobr') {
            $(item).unwrap();
        }
        item.name = 'b';
        item.attribs = {};
    });
    return elem.html();
};

const fetchPhoto = (ctx, url) =>
    ctx.cache.tryGet(url, async () => {
        const res = await got(url);
        const $ = cheerio.load(res.data);
        let html = '';
        $('.content img').each((_, item) => {
            const src = item.attribs.src;
            if (src) {
                html += html ? `<br><img src="${src}">` : `<img src="${src}">`;
            }
        });
        return html;
    });

const fetchVideo = (ctx, url) =>
    ctx.cache.tryGet(url, async () => {
        const res = await got(url);
        const $ = cheerio.load(res.data);
        const js = $('script[type="text/javascript"]:not([src])').html();
        let sources = js.match(/<[^>]*source[^>]+src[^>]+>/g);
        sources = sources && sources.map((item) => item.replace(/'/g, '"').replace(/src="([^"]+)"/g, `src="${rootUrl}$1"`));
        return `<video controls preload="none">${sources.join('\n')}</video>`;
    });

module.exports = {
    parseJucheDate,
    fixDesc,
    fetchPhoto,
    fetchVideo,
};
