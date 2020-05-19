// example usage: `/nature/news-and-comment/ng`
// The journals from NPG are run by different group of people,
// and the website of may not be consitent for all the journals
//
// This router has **just** been tested in:
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

    const journal = ctx.params.journal;
    const pageURL = `${baseURL}/${journal}/news-and-comment`;

    const pageResponse = await got.get(pageURL);
    const pageCapture = cheerio.load(pageResponse.data);

    const pageDescription = pageCapture('meta[name="description"]').attr('content') || `Nature, a nature research journal`;
    const pageTitleName = pageCapture('meta[name="WT.cg_n"]').attr('content') || `Nature (${journal})`;
    const pageTitleSub = pageCapture('meta[name="WT.cg_s"]').attr('content') || 'News & Comment';

    const list = pageCapture('.border-bottom-1.pb20').get();

    const items = await Promise.all(
        list.map(async (el) => {
            const $ = cheerio.load(el);
            const title = $('h3 > a').text();
            const partial = $('h3 > a').attr('href');
            const address = `${baseURL}${partial}`;
            const brief = $('.hide-overflow.inline').text();
            const time = $('time').text();
            const author = $('.js-list-authors-3 li').text();
            const articleType = $('p > span').attr('data-class');
            const headerContents = `
                <div>
                  <p style="color: #666">
                    <span>${articleType}</span>
                    <span>| </span>
                    <span>${author}</span>
                  </p>
                </div>
                `;
            let briefContents = '';
            if (brief !== '') {
                briefContents = `
                <div>
                  <h2 align="left">Brief</h2>
                  <p>${brief}</p>
                </div>
                `;
            }
            const contents = headerContents + briefContents;

            const item = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
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
