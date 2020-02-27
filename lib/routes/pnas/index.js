const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const baseURL = `https://www.pnas.org`;

    let topic = ctx.params.topic;
    let pageURL;
    if (topic === 'latest' || topic === undefined) {
        topic = 'Latest Research';
        pageURL = `${baseURL}/content/early/recent`;
    } else {
        pageURL = `${baseURL}/content/by/section/${ctx.params.tid}`;
    }

    const res = await got.get(pageURL);
    const $ = cheerio.load(res.data);
    const list = $('.highwire-citation-pnas-list-complete').get();

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const title = $('.highwire-cite-title').text();
            const partial = $('.highwire-cite-linked-title').attr('href');
            const address = `${baseURL}${partial}`;
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

            const itemResponse = await got.get(address);
            const itemCapture = cheerio.load(itemResponse.data);

            const pubDate = new Date(itemCapture('meta[name="DC.Date"]').attr('content')).toUTCString();

            const sig = itemCapture('div.executive-summary > p').html();
            let sigContents = '';
            if (sig !== null) {
                sigContents = `
                <div id="rss-journal-sig">
                  <h2 class="rss-journal-paragraph-title">Significance</h2>
                  <p class="rss-journal-paragraph-text">${sig}</p>
                </div>
                `;
            }
            const abs = itemCapture('div.section.abstract > p').html();
            let absContents = '';
            if (abs !== null) {
                absContents = `
                <div id="rss-journal-abs">
                  <h2 class="rss-journal-paragraph-title">Abstract</h2>
                  <p class="rss-journal-paragraph-text">${abs}</p>
                </div>
                `;
            }
            // Info section
            // <meta name="citation_pdf_url" content="https://www.pnas.org/content/pnas/117/7/3492.full.pdf">
            // <meta name="citation_doi" content="10.1073/pnas.1914296117">
            // ul.hw-citation-links > li.bibtext > a
            const citation = itemCapture('ul.hw-citation-links > li.bibtext > a').attr('href');
            const citationContents = citation !== undefined ? `<a href="${baseURL}${citation}">Download citation</a>` : '';
            const doi = itemCapture('meta[name="citation_doi"]').attr('content');
            const doiContents = doi !== undefined ? `<a href="https://doi.org/${doi}">DOI: ${doi}</a>` : '';
            const pdf = itemCapture('meta[name="citation_pdf_url"]').attr('content');
            const pdfContents = pdf !== undefined ? `<a href="${pdf}">Offical PDF</a>` : '';
            const linkContents = '<ul>' + [citationContents, doiContents, pdfContents].filter((x) => x !== '').map((x) => `<li class="rss-journal-tag-icon">${x}</li>`) + '</ul>';
            const infoContents = `
                <div id="rss-journal-info">
                  <h2 class="rss-journal-paragraph-title">About this article</h2>
                  <p>Links:</p>
                  ${linkContents}
                </div>
                `;
            // Add style
            const contentStyle = `
            <style>
              .rss-journal-paragraph-title {
                color: #222;
                padding: 0;
                margin: 12px 0 12px;
                font-family: "Harding","Lora",Palatino,Times,"Times New Roman",serif;
                font-size: 1.8rem;
                line-height: 1.4;
                border-bottom: 1px solid #d5d5d5;
                font-weight: 200;
              }
              .rss-journal-paragraph-text {
                color: #222;
                font-size: 1.2em;
                font-family: Lora,Palatino,Times,"Times New Roman",serif;
                padding: 0;
                margin: 0 0 28px;
                line-height: 1.5;
                word-wrap: break-word;
              }
              .rss-journal-tag-icon {
                line-height: 1.5;
                color:#fff;
                font-size: 0.8rem;
                font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
                background-color:#ffb74d;
                border-radius: 3px;
                padding: 2px 4px;
                font-weight: 700;
                margin: 8px 4px 8px;
                display:inline-block;
              }
              a:link.rss-journal-tag-topic, a:link.rss-journal-tag-icon {
                color: white;
              }
              a:visited.rss-journal-tag-topic, a:link.rss-journal-tag-icon {
                color: grey;
              }
              a:active.rss-journal-tag-topic, a:link.rss-journal-tag-icon {
                color: hotpink;
              }
            </style>
            `;
            const contents = sigContents + absContents + infoContents + contentStyle;

            const single = {
                title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: pubDate,
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `PNAS | ${topic}`,
        link: pageURL,
        item: items,
    };
};
