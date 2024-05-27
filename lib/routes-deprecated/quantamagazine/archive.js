const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://feeder.co/discover/c1d270a6db/quantamagazine-org`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.card-title').get();

    function batchRemove($, array) {
        for (const element of array) {
            $(element).remove();
        }
    }

    function batchRemoveAll($, array) {
        for (const element of array) {
            $(element).each((index, item) => {
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
                return JSON.parse(cache);
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
                const latex = contents.replaceAll(/\$latex([\S\s]+?)\$/g, '<img align="center" src="https://latex.codecogs.com/png.latex?$1"/>');
                contents = latex.replaceAll(/<div id=[\S\s]+?"src":"(https?:?[\S\s]+?)",[\S\s]+?"caption":"([\S\s]*?)",[\S\s]+?<\/div>?/g, (omit, src, cap) => {
                    const imgUrl = src.replaceAll(/\\([^nu])/g, '$1');
                    const img = '<img src=' + imgUrl + ' />';

                    const noBS = cap.replaceAll(/\\([^nu])/g, '$1');
                    const removeNL = noBS.replaceAll('\\n', '');
                    const caption = removeNL.replaceAll(/\\u(\d{1,3}[a-z]\d?|\d{4}?)/g, (omit, s) => String.fromCharCode(Number.parseInt(s, 16)));
                    const inset = '<figure>' + img + '<figcaption>' + caption + '</figcaption>' + '</figure>';
                    return inset;
                });
            }

            const single = {
                title,
                author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: 'Quanta Magazine',
        link: `https://www.quantamagazine.org/`,
        item: out,
    };
};
