const cheerio = require('cheerio');
const { puppeteerGet, renderDesc } = require('./utils');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const pub = ctx.params.pub;
    const jrn = ctx.params.jrn;
    const sec = ctx.params.sec.split('+').join(' ');
    const host = `https://${pub}.scitation.org`;
    const jrnlUrl = `${host}/toc/${jrn}/current?size=all`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const browser = await require('@/utils/puppeteer')();

    const response = await puppeteerGet(jrnlUrl, browser);
    const $ = cheerio.load(response);
    const jrnlName = $('.header-journal-title').text();
    const issueUrl = $('.row.js_issue.highlighted').find('a').attr('href');
    const section = $('.subject-heading')
        .toArray()
        .map((item) => ({
            name: $(item).text(),
        }));

    let ifContainSection = false;
    for (let i = 0, l = section.length; i < l; i++) {
        if (section[i].name === sec) {
            ifContainSection = true;
        }
    }

    let list;
    if (ifContainSection === true) {
        const secUrl = `${issueUrl}?tocSection=${sec}`;
        list = await ctx.cache.tryGet(
            secUrl,
            async () => {
                const response2 = await puppeteerGet(secUrl, browser);
                const $2 = cheerio.load(response2);
                list = $2('.card')
                    .toArray()
                    .map((item) => {
                        $2(item).find('.access-text').remove();
                        const title = $2(item).find('.hlFld-Title').text();
                        const authors = $2(item).find('.entryAuthor.all').text();
                        const img = $2(item).find('img').attr('src');
                        const link = $2(item).find('.ref.nowrap').attr('href');
                        const doi = link.replace('/doi/full/', '');
                        const description = renderDesc(title, authors, doi, img);
                        return {
                            title,
                            link,
                            doi,
                            description,
                        };
                    });
                return list;
            },
            config.cache.routeExpire,
            false
        );
    }

    browser.close();

    ctx.state.data = {
        title: jrnlName.concat(' - ', sec),
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    };
};
