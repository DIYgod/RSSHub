const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.nature.com/nature/research`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.border-bottom-1.pb20').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h3 > a').text();
            const partial = $('h3 > a').attr('href');
            const address = `https://www.nature.com${partial}`;
            const description = $('.hide-overflow.inline').text();
            const time = $('time').text();
            let author;
            if ($('.js-list-authors-3 li').length > 3) {
                author =
                    $('.js-list-authors-3 li')
                        .slice(0, 1)
                        .text() + ' et al.';
            } else {
                author = $('.js-list-authors-3 li').text();
            }
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            const abs = capture('div#Abs1-content.c-article-section__content').html();
            let contents;
            if (description !== '' && abs !== null) {
                contents = `${description}<p><div><center style="font-size: 16pt"><b>Abstraction</b></center><p>${abs}</p></div>`;
            } else {
                if (abs !== null) {
                    contents = `<center><b>Abstraction</b></center>` + abs;
                }
                if (description !== '') {
                    contents = description;
                }
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
        title: `Nature | Latest Research`,
        link: url,
        item: out,
    };
};
