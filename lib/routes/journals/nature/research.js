// example usage: `/nature/research/ng`
// The journals from NPG are run by different group of people,
// and the website of may not be consitent for all the journals
//
// This router has **just** been tested in:
// nature:           Nature
// nbt:              Nature Biotechnology
// neuro:            Nature Neuroscience
// ng:               Nature Genetics
// ni:               Nature Immunology
// nmeth:            Nature Method
// nchem:            Nature Chemistry
// nmat:             Nature Materials
// natmachintell:    Nature Machine Intelligence

const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseURL = `https://www.nature.com`;

    const journal = ctx.params.journal || 'nature';
    const pageURL = `${baseURL}/${journal}/research`;

    const pageResponse = await got.get(pageURL);
    const pageCapture = cheerio.load(pageResponse.data);

    const pageDescription = pageCapture('meta[name="description"]').attr('content') || `Nature, a nature research journal`;
    const pageTitleName = pageCapture('meta[name="WT.cg_n"]').attr('content') || `Nature (${journal})`;
    const pageTitleSub = pageCapture('meta[name="WT.cg_s"]').attr('content') || 'Latest Research';

    const list = pageCapture('.border-bottom-1.pb20').get();

    const items = await Promise.all(
        list.slice(4, 6).map(async (el) => {
            const $ = cheerio.load(el);
            const title = $('h3 > a').text();
            const partial = $('h3 > a').attr('href');
            const address = `${baseURL}${partial}`;
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
            const itemResponse = await got.get(address);
            const itemCapture = cheerio.load(itemResponse.data);
            const abs = itemCapture('div#Abs1-content.c-article-section__content > p').html();

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

            const item = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );
    ctx.state.data = {
        title: `${pageTitleName} | ${pageTitleSub}`,
        description: pageDescription,
        link: pageURL,
        item: items,
    };
};
