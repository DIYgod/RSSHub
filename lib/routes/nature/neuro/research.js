const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const base = `https://www.nature.com`;
    const url = `${base}/neuro/research`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.border-bottom-1.pb20').get();

    const out = await Promise.all(
        list.slice(0, 3).map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('h3 > a').text();
            const partial = $('h3 > a').attr('href');
            const address = `${base}${partial}`;
            const brief = $('.hide-overflow.inline').text();
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
            const abs = capture('div#Abs1-content.c-article-section__content > p').html();

            let briefContents = '';
            if (brief !== '') {
                briefContents = `
                <div>
                  <h2 align="left">Brief</h2>
                  <p>${brief}</p>
                </div>
                `;
            }
            let absContents = '';
            if (abs !== null) {
                absContents = `
                <div>
                  <h2 align="left">Abstract</h2>
                  <p>${abs}</p>
                </div>
                `;
            }
            const contents = briefContents + absContents;

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
        title: `Nature Neuroscience | Latest Research`,
        description: `Nature Neuroscience, a nature research journal`,
        link: url,
        item: out,
    };
};
