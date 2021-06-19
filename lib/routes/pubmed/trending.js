const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = require('url');
const date = require('@/utils/date');

const base = 'https://pubmed.ncbi.nlm.nih.gov';

module.exports = async (ctx) => {
    const link = `${base}/trending/`;
    const response = await got.get(encodeURI(link));
    const pageCapture = cheerio.load(response.data);

    const list = pageCapture('.docsum-content')
        .map((_, elem) => {
            const $ = cheerio.load(elem);
            const partial = $('a').attr('href');
            return {
                title: $('a').text().trim(),
                link: url.resolve(base, partial),
                author: $('.full-authors').text(),
            };
        })
        .get();

    const out = await Promise.all(
        list.map(
            async (item) =>
                await ctx.cache.tryGet(item.link, async () => {
                    const detail = await got.get(item.link);
                    const detailCapture = cheerio.load(detail.data);

                    item.doi = detailCapture('meta[name="citation_doi"]').attr('content');
                    item.pubDate = date(detailCapture('meta[name="citation_date"]').attr('content'));

                    let authorContents = '';
                    if (item.author !== '') {
                        authorContents = `
                    <div id="author-content">
                      <span style="color: grey">${item.author}</span>
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

                    return item;
                })
        )
    );

    ctx.state.data = {
        title: 'PubMed | Trending Articles',
        description: 'Trending Articles from PubMed Website',
        link: link,
        item: out,
    };
};
