const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://aeon.co/${ctx.params.cid}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.cYolgs > a').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.styled__Title-sc-14lmmht-10').text();
            const partial = $('a').attr('href');
            const address = `https://aeon.co${partial}`;
            const author = $('.styled__Author-sc-14lmmht-12').text();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const time = capture('.article__PublishedDate-br4ey4-14').text();

            capture('div.newsletter-signup').remove();
            capture('p.pullquote').remove();
            capture('div.article__related').remove();
            capture('div.article__shares').remove();

            let bio;
            const authorInfo = '.VEKKL';
            if (capture(authorInfo).html() !== null) {
                bio =
                    `<br><br><hr><span><p>` +
                    capture(authorInfo)
                        .html()
                        .replace(/<\/?span[^>]*>/g, '')
                        .replace(/<\/?p[^>]*>/g, ' ') +
                    `</p></span><hr>`;
            } else {
                bio = '';
            }

            const imgLink = capture("head meta[property='og:image']").attr('content');
            const banner = `<img src="${imgLink}">`;

            // Currently this route is not perfectly compatible with '/videos'

            const contents = banner + capture('.has-dropcap').html() + bio;
            const single = {
                title,
                author,
                pubDate: new Date(time).toUTCString(),
                description: contents,
                link: address,
                guid: address,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: url,
        item: out,
    };
};
