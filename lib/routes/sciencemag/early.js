// only support Science journal

const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const base = `https://science.sciencemag.org/content/early/recent`;

    const res = await got.get(base);
    const pageCapture = cheerio.load(res.data);

    const list = pageCapture('ul > li > div > article > div').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('h3').text();
            const partial = $('h3 > a').attr('href');
            const address = `${base}${partial}`;

            let author;
            const authorList = $('span.highwire-citation-authors > span.highwire-citation-author')
                .map((i, el) => $(el).text())
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
                  <p>${brief}</p>
                </div>
                `;
            }

            const itemPage = await got.get(address);
            const itemCapture = cheerio.load(itemPage.data);
            // section content
            const section = itemCapture('header > div.overline').text();
            let sectionContents = '';
            if (section !== '') {
                sectionContents = `
                <div id="content-section">
                  <span style="color: #d40016; text-transform: uppercase; font-weight: 700;">${section}</span>
                  <span style="color: grey; text-transform: uppercase; font-weight: 700;">[Published Online]</span>
                </div>
                `;
            }
            // abs content
            const abs = itemCapture('div > div.abstract-view > div.section')
                .map((i, el) => $(el).html())
                .get()
                .join('<br>');
            let absContents = '';
            if (abs !== null) {
                absContents = `
                <div id="content-abs">
                  ${abs}
                </div>
                `;
            }
            const contents = sectionContents + briefContents + absContents;

            const single = {
                title,
                author,
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
