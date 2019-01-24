const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const logger = require('../../utils/logger');
const axios = require('../../utils/axios');
const domain = 'https://www.xgmn5.com';
const encoding = 'gb18030';

// similar to encodeURIComponent, but encode in any desired encoding
// lack support for something like blank space
const _encodeURIComponent = (x) =>
    x
        .split('')
        .map((y) => {
            if (!RegExp(/^[\x00-\x7F]*$/).test(y)) {
                return iconv
                    .encode(y, encoding)
                    .reduce((a, b) => a + '%' + b.toString(16), '')
                    .toUpperCase();
            } else {
                return y;
            }
        })
        .join('');

const _json2data = (x) => {
    if (typeof x === 'string' || x instanceof String) {
        return _encodeURIComponent(x);
    } else {
        const str = [];
        for (const p in x) {
            if (x.hasOwnProperty(p)) {
                str.push(p + '=' + x[p]);
            }
        }
        return _encodeURIComponent(str.join('&'));
    }
};

const instance = {
    get: async (link) => {
        const res = await axios({
            method: 'get',
            url: link,
            responseType: 'arraybuffer',
        });
        const resData = iconv.decode(res.data, encoding);
        return cheerio.load(resData);
    },

    post: async (link, data) => {
        const res = await axios({
            method: 'post',
            url: link,
            data: _json2data(data),
            responseType: 'arraybuffer',
        });
        const resData = iconv.decode(res.data, encoding);
        return cheerio.load(resData);
    },
};

async function loadAlbum(albumLink) {
    const albumID = albumLink.split('/').slice(-1)[0];
    const $$ = await instance.get(albumLink);
    const albumName = $$('.title')
        .text()
        .trim();

    let timeShift = albumName.match(/\d+/); // find vol number in name
    if (timeShift) {
        timeShift = Number(timeShift[0]) * 1000;
    } else {
        timeShift = 12 * 60 * 60 * 1000;
    }
    let date = RegExp(/\d{4}-\d{2}-\d{2}/).exec(
        $$('iframe')
            .closest('td')
            .text()
    );
    if (date) {
        date = new Date(date[0]);
    } else {
        logger.info('No pubDate for ' + albumLink);
        date = new Date('2000-01-01');
    }
    const pubDate = new Date(date.getTime() + timeShift).toUTCString();
    const albumPages = $$('.page')
        .first()
        .children('a')
        .map(function(i, el) {
            return domain + el.attribs.href;
        })
        .toArray()
        .slice(0, -1);

    if (albumPages.length === 0) {
        albumPages.push(albumLink);
    }

    const promises = albumPages.map(async (x) => {
        const $ = await instance.get(x);
        const thisImgs = $('.img p img')
            .map(function(i, el) {
                return domain + el.attribs.src;
            })
            .toArray();
        return Promise.resolve(thisImgs);
    });

    try {
        const result = await Promise.all(promises);
        const imgs = [].concat.apply([], result);
        let nP = RegExp(/(\d+)P/).exec(albumName);
        if (nP) {
            nP = Number(nP[1]);
            if (imgs.length < nP) {
                const temp1 = imgs[0].split('/');
                const temp2 = temp1.slice(0, -1).join('/');
                const f0 = Number(RegExp(/\d+/).exec(temp1[temp1.length - 1])[0]);
                const ext = temp1[temp1.length - 1].split('.')[1];
                for (let i = imgs.length + 1; i < nP + 1; i++) {
                    // fallback method if the owner of the website doesn't post all images
                    // it doesn't always work
                    imgs.push(temp2 + '/' + (f0 + i - 1).toString() + '.' + ext);
                }
            }
        }
        return {
            albumName: albumName,
            imgLinks: imgs,
            pubDate: pubDate,
            id: albumID,
        };
    } catch (error) {
        logger.error(albumLink + ' failed');
        return {
            albumName: albumName,
            imgLinks: null,
            pubDate: null,
            id: albumID,
        };
    }
}

module.exports = {
    loadAlbum,
    instance,
    domain,
    encoding,
    _json2data,
};
