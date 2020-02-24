const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const base = `https://science.sciencemag.org`;

    const res = await got.get(base);
    const pageCapture = cheerio.load(res.data);

    // just select paper relative sections
    const sectionList = ['issue-toc-section-research-articles', 'issue-toc-section-review', 'issue-toc-section-reports'];
    const list = [].concat.apply(
        [],
        sectionList.map((section) => {
            const sec = cheerio.load(pageCapture(`ul > li .issue-toc-section.${section}`).html());
            const sectionName = sec('h2').text();
            const sectionList = sec('ul > li > div > div > article > div')
                .append(`<div class="toc-section-type">${sectionName}</div>`)
                .get();
            return sectionList;
        })
    );

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);

            const title = $('h3').text();
            const partial = $('h3 > a').attr('href');
            const address = `${base}${partial}`;
            const section = $('div .toc-section-type').text();

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
            // section content
            let sectionContents = '';
            if (section !== '') {
                sectionContents = `
                <div id="content-section">
                  <span style="color: #d40016; text-transform: uppercase; font-weight: 700;">${section}</span>
                </div>
                `;
            }
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
            const abs = itemCapture('div > div.abstract-view > div.section')
                .map(function(i, el) {
                    return $(el).html();
                })
                .get()
                .join('<br>');

            // abs content
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
        title: `Science | Current Table of Contents`,
        description: `Science, a research journal`,
        link: base,
        item: out,
    };
};
