const util = require('./utils');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    const key = ctx.params.key;
    // key = '黑丝';
    const link = util.domain + '/plus/search/index.asp';
    const res = await util.instance.post(link, "keyword=" + util._encodeStr(key));
    const data = iconv.decode(res.data, util.encoding);
    const $ = cheerio.load(data);
    const pages = $('.page a').map((i, el) => util.domain + el.attribs.href).toArray();

    const albumLink = $('.title1 a').map((i, el) => util.domain + el.attribs.href).toArray();
    const albumName = $('.title1 a').map((i, el) => $(el).text()).toArray();
    if (pages.length > 1) {
        const promises = pages.slice(1, -1).map(async (x) => {
            const pageRes = await util.instance.get(x);
            const $$ = cheerio.load(iconv.decode(pageRes.data, util.encoding));
            const pageAlbumLink = $$('.title1 a').map((i, el) => util.domain + el.attribs.href).toArray();
            const pageAlbumName = $$('.title1 a').map((i, el) => $(el).text()).toArray();
            return Promise.resolve([pageAlbumLink, pageAlbumName]);
        });

        const result = await Promise.all(promises);
        result.forEach((x) => {
            x[0].forEach((y) => albumLink.push(y));
            x[1].forEach((y) => albumName.push(y));
        });
    }


    const resultItem = await Promise.all(
        albumLink.map(async (x, i) => {
            const albumID = 'xgyw_' + x.split('/').slice(-1)[0];
            const item = {
                title: albumName[i].trim(),
                description: '',
                link: x,
                pubDate: ''
            };

            const value = await ctx.cache.get(albumID);

            if (value) {
                const v2 = JSON.parse(value);
                item.description = v2.des;
                item.pubDate = v2.pubDate;
            } else {
                const y = await util.loadAlbum(x);
                item.description = y.imgLinks.reduce(
                    (description, imgUrl) => description + `<img referrerpolicy="no-referrer" src="${imgUrl}"><br />`,
                    '<br>');
                item.pubDate = y.pubDate;
                ctx.cache.set(albumID, JSON.stringify({
                    'des': item.description,
                    'pubDate': y.pubDate
                }), 12 * 60 * 60);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '性感美女屋 Keyword ' + key,
        link: link + key,
        description: '性感美女屋 Keyword ' + key,
        item: resultItem
    };
};
