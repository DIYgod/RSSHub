// cell.com is extremely slow, and redirect too many times.
// Thus, the content page are replaced by www.sciencedirect.com.

const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseURL = 'https://www.cell.com';
    const category = ctx.params.category;
    let pageURL = `${baseURL}/cell/current.rss`;
    let categoryTitle = 'Latest issue';
    if (category === 'inpress') {
        pageURL = `${baseURL}/cell/inpress.rss`;
        categoryTitle = 'Articles in press';
    }

    const alternativeURL = 'https://www.sciencedirect.com/science/article/pii/';
    const pageResponse = await got.get(pageURL);
    const pageCapture = cheerio.load(pageResponse.data);

    const list = pageCapture('item')
        .get()
        .filter((item) => {
            const $ = cheerio.load(item);
            const section = $('prism\\:section').text();

            return ['Article', 'Resource'].includes(section);
        });

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const section = $('prism\\:section').text();
            const address = alternativeURL + $('item').attr('rdf:about').replace('?rss=yes', '').split('/').pop();
            const title = $('dc\\:title').text();
            const author = $('dc\\:creator').text();
            const pubDate = new Date($('dc\\:date').text()).toUTCString();
            const cache = await ctx.cache.get(address);
            if (cache) {
                return JSON.parse(cache);
            }
            const itemPage = await got.get(address);
            const itemCapture = cheerio.load(itemPage.data);
            // section + keywords content
            const keywords = itemCapture('div.keywords-section > div.keyword')
                .map((i, el) => $(el).text())
                .get()
                .join('; ');
            const sectionContents = `
                <div id="content-section">
                  <span style="color: #007dbc; text-transform: uppercase; font-weight: 700;">${section}</span>
                  <br>
                  <p style="color: grey; font-weight: 700;">[${keywords}]</p>
                </div>
                `;
            // graphical content
            const brief = $('description').text();
            const graphical = itemCapture('div.abstract.graphical').find('img').attr('src');
            let graphicalContents = '';
            if (graphical !== '') {
                graphicalContents = `
                <div id="content-graphical">
                  <h2 style="color: #007dbc; font-weight: 700;">Graphical Abstract</h2>
                  <center>
                    <figure>
                      <img src="${graphical}" height="400" alt="">
                    </figure>
                  </center>
                  <span>${brief}</span>
                </div>`;
            }
            // highlight content
            const highlight = itemCapture('div.abstract.author-highlights dl').html();
            let highlightContents = '';
            if (highlight !== '') {
                highlightContents = `
                <div id="content-highlight">
                  <h2 style="color: #007dbc; font-weight: 700;">Highlights</h2>
                  ${highlight}
                </div>`;
            }
            // summary content
            const summary = itemCapture('div.abstract.author p').html();
            let summaryContents = '';
            if (summary !== '') {
                summaryContents = `
                <div id="content-summary">
                  <h2 style="color: #007dbc; font-weight: 700;">Summary</h2>
                  ${summary}
                </div>`;
            }
            const contents = sectionContents + graphicalContents + highlightContents + summaryContents;

            const single = {
                title,
                author,
                description: contents,
                link: address,
                guid: address,
                doi: $('dc\\:identifier').text(),
                pubDate,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return single;
        })
    );
    ctx.state.data = {
        title: `Cell | ${categoryTitle}`,
        description: `Cell, a research journal`,
        link: baseURL,
        item: out,
    };
};
