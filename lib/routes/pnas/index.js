const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseUrl = `https://www.pnas.org`;

    const topic = ctx.params.topic;

    let url = `${baseUrl}/content/early/recent`;
    if (topic && topic !== 'latest') {
        url = `${baseUrl}/content/by/section/${ctx.params.topic}`;
    } else {
        ctx.params.topic = 'Latest Research';
    }

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.highwire-citation-pnas-list-complete').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.highwire-cite-title').text();
            const partial = $('.highwire-cite-linked-title').attr('href');
            const address = `${baseUrl}${partial}`;
            let author;
            if ($('.highwire-citation-authors span').length > 3) {
                author = $('.highwire-citation-author.first').text() + ' et al.';
            } else {
                author = $('.highwire-citation-authors span').text();
            }
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);

            const significance = capture('.executive-summary').html();
            const abstract = capture('.section.abstract').html();
            let contents;
            if (abstract !== null) {
                contents = significance + abstract;
            } else {
                contents = significance;
            }

            const single = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                doi: capture('meta[name="DC.Identifier"]')[0].attribs.content,
                pubDate: new Date(capture('meta[name="DC.Date"]')[0].attribs.content).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `PNAS | ${ctx.params.topic}`,
        link: url,
        item: out,
    };
};
