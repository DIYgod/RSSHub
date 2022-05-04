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
        list.map(async (el) => {
            const $ = cheerio.load(el);
            const title = $('h3 > a').text();
            const partial = $('h3 > a').attr('href');
            const address = `${baseURL}${partial}`;
            const brief = $('.hide-overflow.inline').text();
            const time = $('time').text();
            let author;
            if ($('.js-list-authors-3 li').length > 3) {
                author = $('.js-list-authors-3 li').slice(0, 1).text() + ' et al.';
            } else {
                author = $('.js-list-authors-3 li').text();
            }
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const itemResponse = await got.get(address);
            const itemCapture = cheerio.load(itemResponse.data);

            // Brief [obtain from entry of each item]
            let briefContents = '';
            if (brief !== '') {
                briefContents = `
                <div id="rss-journal-brief">
                  <h2 class="rss-journal-paragraph-title">Brief</h2>
                  <p class="rss-journal-paragraph-text">${brief}</p>
                </div>
                `;
            }
            // Abstract [obtain form address of each page]
            const abs = itemCapture('div#Abs1-content.c-article-section__content > p').html();
            let absContents = '';
            if (abs !== null) {
                absContents = `
                <div id="rss-journal-abs">
                  <h2 class="rss-journal-paragraph-title">Abstract</h2>
                  <p class="rss-journal-paragraph-text">${abs}</p>
                </div>
                `;
            }
            // Info [obtain form address of each page]
            const subject = itemCapture('li.c-article-subject-list__subject > a')
                .map(function () {
                    const link = $(this).attr('href');
                    const name = $(this).text();
                    if (name !== '') {
                        return `<li class="rss-journal-tag-topic"><a href="${link}">${name}</a></li>`;
                    } else {
                        return '';
                    }
                })
                .get()
                .join('');
            const subjectContents = subject !== '' ? `<ul>${subject}</ul>` : '';
            const citation = itemCapture('p.c-bibliographic-information__download-citation > a').attr('href');
            const citationContents = citation !== undefined ? `<a href="${baseURL}${citation}">Download citation</a>` : '';
            const doi = itemCapture('meta[name="DOI"]').attr('content');
            const doiContents = doi !== undefined ? `<a href="https://doi.org/${doi}">DOI: ${doi}</a>` : '';
            const pdf = itemCapture('meta[name="citation_pdf_url"]').attr('content');
            const pdfContents = pdf !== undefined ? `<a href="${pdf}">Offical PDF</a>` : '';
            const linkContents = '<ul>' + [citationContents, doiContents, pdfContents].filter((x) => x !== '').map((x) => `<li class="rss-journal-tag-icon">${x}</li>`) + '</ul>';
            const infoContents = `
                <div id="rss-journal-info">
                  <h2 class="rss-journal-paragraph-title">About this article</h2>
                  <p>Subjects:</p>
                  ${subjectContents}
                  <br>
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
              .rss-journal-tag-topic {
                line-height: 1.5;
                color: #222;
                font-size: 0.8rem;
                font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;
                background-color: #dae5ea;
                border-radius: 15px;
                padding: 6px 6px;
                font-weight: 700;
                margin: 8px 4px 8px;
                display:inline-block;
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
            const contents = briefContents + absContents + infoContents + contentStyle;

            const item = {
                title,
                author,
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
