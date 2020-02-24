const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const base = `https://advances.sciencemag.org`;

    const res = await got.get(base);
    const pageCapture = cheerio.load(res.data);

    const list = pageCapture('ul > li > div > div > article > div').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('h3').text();
            const partial = $('h3 > a').attr('href');
            // TODO: .full.txt is a way for getting text preview
            const address = `${base}${partial}`;

            let author;
            const authorList = $('span.highwire-citation-authors > span.highwire-citation-author')
                .map(function(i, el) {
                    return $(el).text();
                })
                .get();
            if (authorList.length > 5) {
                author = authorList.slice(0, 5).join(', ') + ' <i>et al.</i>';
            } else {
                author = authorList.join(', ');
            }

            const time = new Date($('p.highwire-cite-metadata > time').text()).toUTCString();

            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            // contents
            // brief content
            const brief = $('div.highwire-cite-snippet > div > div > p').text();
            let briefContents = '';
            if (brief !== '') {
                briefContents = `
                <div id="content-brief">
                  <h2>Brief</h2>
                  <p>${brief}</p>
                </div>
                `;
            }

            const itemPage = await got.get(address);
            const itemCapture = cheerio.load(itemPage.data);
            // section and subject content
            const section = itemCapture('header > div.overline > span.overline__section').text();
            const subject = itemCapture('header > div.overline > span.overline__subject').text();
            let sectionContents = '';
            if (section !== '' || subject !== '') {
                sectionContents = `
                <div id="content-section">
                  <span style="color: #d40016; text-transform: uppercase; font-weight: 700;">${section}</span>
                  <span style="color: #666; text-transform: uppercase; font-weight: 400; border-left: 1px solid #e6e6e6;">${subject}</span>
                </div>
                `;
            }
            // abs content
            const abs = itemCapture('div.section.abstract > p').text();
            let absContents = '';
            if (abs !== '') {
                absContents = `
                <div id="content-abs">
                  <h2>Abstract</h2>
                  ${abs}
                </div>
                `;
            }
            const contents = sectionContents + briefContents + absContents;

            const single = {
                title: title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: time,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `Science | First Release`,
        description: `Science, a research journal. For papers that published online.`,
        link: base,
        item: out,
    };
};
