const cheerio = require('cheerio');
const { puppeteerGet, renderDesc } = require('./utils');

module.exports = async (ctx) => {
    const pub = ctx.params.pub;
    const jrn = ctx.params.jrn;
    const host = `https://${pub}.scitation.org`;
    const jrnlUrl = `${host}/toc/${jrn}/current?size=all`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(jrnlUrl, ctx.cache);

    const $ = cheerio.load(html);
    const jrnlName = $('.header-journal-title').text();
    const list = $('.card')
        .map((_, item) => {
            $(item).find('.access-text').remove();
            const title = $(item).find('.hlFld-Title').text();
            const authors = $(item).find('.entryAuthor.all').text();
            const img = $(item).find('img').attr('src');
            const link = $(item).find('.ref.nowrap').attr('href');
            const doi = link.replace('/doi/full/', '');
            const description = renderDesc(title, authors, doi, img);
            return {
                title,
                link,
                doi,
                description,
            };
        })
        .get();

    ctx.state.data = {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    };
};
