const util = require('./utils');

module.exports = async (ctx) => {
    const key = ctx.params.key;
    const count = Number(ctx.params.count) || 10;
    // count = 0: grab all images
    const speed = Number(ctx.params.speed) || 5;
    const link = util.domain + '/plus/search/index.asp';
    const $ = await util.instance.post(link, {
        keyword: key,
        button: '搜索',
    });
    const pages = $('.page a')
        .map((i, el) => util.domain + el.attribs.href)
        .toArray();
    let albumLink = $('.title1 a')
        .map((i, el) => util.domain + el.attribs.href)
        .toArray();
    let albumName = $('.title1 a')
        .map((i, el) => $(el).text())
        .toArray();

    if (pages.length > 1 && (count > albumLink.length || count === 0)) {
        const promises = pages.slice(1, pages.length).map(async (x) => {
            const $$ = await util.instance.get(x);
            const pageAlbumLink = $$('.title1 a')
                .map((i, el) => util.domain + el.attribs.href)
                .toArray();
            const pageAlbumName = $$('.title1 a')
                .map((i, el) => $(el).text())
                .toArray();
            return Promise.resolve([pageAlbumLink, pageAlbumName]);
        });

        const result = await Promise.all(promises);
        result.forEach((x) => {
            x[0].forEach((y) => albumLink.push(y));
            x[1].forEach((y) => albumName.push(y));
        });
    }

    if (count !== 0) {
        albumLink = albumLink.slice(0, Math.min(count, albumLink.length));
        albumName = albumName.slice(0, Math.min(count, albumName.length));
    }
    const resultItem = [];
    const ng = albumLink.length % speed === 0 ? albumLink.length / speed : Math.ceil(albumLink.length / speed);

    for (let ig = 0; ig < ng; ig++) {
        const ig1 = ig * speed;
        const ig2 = Math.min(ig1 + speed, albumLink.length);
        // limit number of requests

        // eslint-disable-next-line no-await-in-loop
        const igResultItem = await Promise.all(
            albumLink.slice(ig1, ig2).map(async (x, i) => {
                const albumID = 'xgyw_' + x.split('/').slice(-1)[0];
                const item = {
                    title: albumName[i].trim(),
                    description: '',
                    link: x,
                    pubDate: '',
                };

                const value = await ctx.cache.get(albumID);

                if (value) {
                    const v2 = JSON.parse(value);
                    item.description = v2.des;
                    item.pubDate = v2.pubDate;
                } else {
                    const y = await util.loadAlbum(x);
                    item.description = y.imgLinks.reduce((description, imgUrl) => description + `<img referrerpolicy="no-referrer" src="${imgUrl}"><br />`, '<br>');
                    item.pubDate = y.pubDate;
                    ctx.cache.set(
                        albumID,
                        JSON.stringify({
                            des: item.description,
                            pubDate: y.pubDate,
                        }),
                        12 * 60 * 60
                    );
                }

                return Promise.resolve(item);
            })
        );
        igResultItem.forEach((x) => resultItem.push(x));
    }

    ctx.state.data = {
        title: '性感美女屋 Keyword ' + key,
        link: link + key,
        description: '性感美女屋 Keyword ' + key,
        item: resultItem,
    };
};
