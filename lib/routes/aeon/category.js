const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://aeon.co/${ctx.params.cid}`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.article-card').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.article-card__title').text();
            const partial = $('.article-card__title').attr('href');
            const address = `https://aeon.co${partial}`;
            const author = $('.article-card__authors__inner').text();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const time = capture('.article__date.published').text();

            capture('div.newsletter-signup').remove();
            capture('p.pullquote').remove();
            capture('div.article__related').remove();
            capture('div.article__shares').remove();

            let bio;
            const authorInfo = '.article__body__author-details > p:nth-child(2)';
            if (capture(authorInfo).html() !== null) {
                bio = `<br><br><hr><br><b>` + author.trim() + '</b> ' + capture(authorInfo).html().trim() + `<p></p><hr>`;
                capture('.article__inline-sidebar').remove();
            } else {
                bio = '';
            }

            let banner;
            if (capture('.article-card__image-wrap').html() !== null) {
                const imgSty = capture('figure.responsive-image').attr('style');
                const imgLink = imgSty.match(/url\(["']?([^"']*)["']?\)/)[1];
                banner = `<img src="${imgLink}">`;
            }
            if (capture('.article__image__wrapper').html() !== null) {
                banner = '';
                capture('img').each((index, item) => {
                    item = $(item);
                    item.removeAttr('alt');
                });
                capture('.display-article').remove;
            }
            if (capture('.video__embed').html() !== null) {
                banner = capture('div.video__embed').html();
                capture('.article__header__subtitle').remove();
            }

            const contents = banner + capture('.article__body__content').html() + bio;
            const single = {
                title,
                author: author,
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
