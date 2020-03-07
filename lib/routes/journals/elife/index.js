const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = `https://elifesciences.org`;
    const tid = ctx.params.tid;

    let url = baseUrl;
    if (tid !== 'latest') {
        url = `${baseUrl}/subjects/${ctx.params.tid}`;
    }

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    $('.grid-secondary-column').remove();

    let topic = 'latest';
    if (tid !== 'latest') {
        topic = $('h1.content-header__title.content-header__title--xx-short').text();
    }

    const list = $('li.listing-list__item').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('a.teaser__header_text_link').text();
            const partial = $('a.teaser__header_text_link').attr('href');
            const address = `${baseUrl}${partial}`;
            const time = $('time').text();
            const description = $('div.teaser__body').text();
            const author = $('div.teaser__secondary_info')
                .text()
                .trim();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);

            const abstract = capture('#abstract .article-section__body').html();
            let contents;
            if (description !== '') {
                contents = `${description}<br /><br /><h2 style="font-size: 14pt"><center>Abstract</center></h2>${abstract}`;
            } else {
                contents = `<h2"><center>Abstract</center></h2>${abstract}`;
            }

            const single = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                doi: capture('meta[name="dc.identifier"]')[0].attribs.content,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `eLife | ${topic}`,
        link: url,
        item: out,
    };
};
