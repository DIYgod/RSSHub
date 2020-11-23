const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const date = require('@/utils/date');

const base = 'https://pubmed.ncbi.nlm.nih.gov';

module.exports = async (ctx) => {
    const link = `${base}/trending/`;
    const response = await got.get(encodeURI(link));
    const pageCapture = cheerio.load(response.data);

    const list = pageCapture('.docsum-content').get();
    const out = await Promise.all(
        list.map(async (elem) => {
            const $ = cheerio.load(elem);
            const title = $('a').text().trim();
            const partial = $('a').attr('href');
            const address = url.resolve(base, partial);
            const author = $('.full-authors').text();
            const detail = $('.full-journal-citation').text().split('. ');
            const doi = detail[2].replace('doi: ', '');
            const pubDate = date(detail[1]);

            const item = {
                doi,
                title,
                author,
                pubDate,
                link: encodeURI(address),
            };

            const value = await ctx.cache.get(address);
            if (value) {
                item.description = value;
            } else {
                const detail = await got.get(item.link);
                const detailCapture = cheerio.load(detail.data);

                let authorContents = '';
                if (author !== '') {
                    authorContents = `
                    <div id="author-content">
                      <span style="color: grey">${author}</span>
                    </div>
                    `;
                }
                const abs = detailCapture('#enc-abstract').html();
                let absContents = '';
                if (abs !== null) {
                    absContents = `
                    <div id="abstract-content">
                      <h2 align="left">Abstract</h2>
                      <p>${abs}</p>
                    </div>
                    `;
                }
                item.description = authorContents + absContents;
                ctx.cache.set(address, item.description);
            }

            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: 'PubMed | Trending Articles',
        description: 'Trending Articles from PubMed Website',
        link: link,
        item: out,
    };
};
