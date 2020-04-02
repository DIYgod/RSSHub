const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://feeder.co/discover/c1d270a6db/quantamagazine-org`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.card-title').get();

    function batchRemove($, array) {
        for (let index = 0; index < array.length; index++) {
            $(array[index]).remove();
        }
    }

    function batchRemoveAll($, array) {
        for (let index = 0; index < array.length; index++) {
            $(array[index]).each((index, item) => {
                $(item).remove();
            });
        }
    }

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.discover-feed-item-link').text();
            const address = $('.discover-feed-item-link').attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);

            const infos = ['.post__footer', '.post__title__author-date'];
            batchRemove(capture, infos);

            const author = capture('h3.mv05').text();
            const time = capture('.align-c.mb075 > p > em').text();

            const unnecessary = ['.header-spacer', '.scale1.mha', '.post__title__author-date', '.post__aside--divider'];
            batchRemove(capture, unnecessary);

            const disturbing = ['.hide-on-print', '.post__aside__pullquote', 'aside.post__sidebar.hide'];
            batchRemoveAll(capture, disturbing);

            let contents = capture('#postBody').html();
            if (contents !== null) {
                const latex = contents.replace(/\$latex([\s\S]+?)\$/g, '<img align="center" src="https://latex.codecogs.com/png.latex?$1"/>');
                contents = latex.replace(/<div id=[\S\s]+?"src":"(https?:?[\s\S]+?)",[\S\s]+?"caption":"([\s\S]*?)",[\S\s]+?<\/div>?/g, function(omit, src, cap) {
                    const imgUrl = src.replace(/\\([^un])/g, '$1');
                    const img = '<img src=' + imgUrl + ' />';

                    const noBS = cap.replace(/\\([^un])/g, '$1');
                    const removeNL = noBS.replace(/\\n/g, '');
                    const caption = removeNL.replace(/\\u([0-9]{1,3}[a-z][0-9]?|[0-9]{4}?)/g, function(omit, s) {
                        return String.fromCharCode(parseInt(s, 16));
                    });
                    const inset = '<figure>' + img + '<figcaption>' + caption + '</figcaption>' + '</figure>';
                    return inset;
                });
            }

            const single = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Quanta Magazine',
        link: `https://www.quantamagazine.org/`,
        item: out,
    };
};
