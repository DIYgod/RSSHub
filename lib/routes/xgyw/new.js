const util = require('./utils');

module.exports = async (ctx) => {
    const { count = 10 } = ctx.params;
    const $ = await util.instance.get(util.domain + '/new.html');
    let albumLink = $('.td3 div a')
        .map((i, el) => util.domain + el.attribs.href)
        .toArray();
    let albumName = $('.td3 div a')
        .map((i, el) => el.attribs.title)
        .toArray();
    if (Number(count) < 100) {
        albumLink = albumLink.slice(0, Number(count));
        albumName = albumName.slice(0, Number(count));
    }

    const resultItem = await Promise.all(
        albumLink.map(async (x, i) => {
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

    ctx.state.data = {
        title: '性感美女屋 New' + count,
        link: util.domain + '/new.html',
        description: '性感美女屋 New' + count,
        item: resultItem,
    };
};
