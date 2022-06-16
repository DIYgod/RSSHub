const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const pub = ctx.params.pub;
    const jrn = ctx.params.jrn;
    const sec = ctx.params.sec.split('+').join(' ');
    const host = `https://${pub}.scitation.org`;
    const jrnlUrl = `${host}/toc/${jrn}/current?size=all`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);
    const jrnlName = $('.header-journal-title').text();
    const issueUrl = $('.row.js_issue.highlighted').find('a').attr('href');
    const section = $('.subject-heading')
        .map((_, item) => ({
            name: $(item).text(),
        }))
        .get();

    let list;
    let ifContainSection = false;
    for (let i = 0, l = section.length; i < l; i++) {
        if (section[i].name === sec) {
            ifContainSection = true;
        }
    }
    if (ifContainSection === true) {
        const secUrl = `${issueUrl}?tocSection=${sec}`;
        const response2 = await got(secUrl, {
            cookieJar,
        });
        const $2 = cheerio.load(response2.data);
        list = $2('.card')
            .map((_, item) => {
                $2(item).find('.access-text').remove();
                const title = $2(item).find('.hlFld-Title').text();
                const authors = $2(item).find('.entryAuthor.all').text();
                const img = $2(item).find('img').attr('src');
                const link = $2(item).find('.ref.nowrap').attr('href');
                const doi = link.replace('/doi/full/', '');
                return {
                    title,
                    link,
                    doi,
                    authors,
                    img,
                };
            })
            .get();

        const renderDesc = (item) =>
            art(path.join(__dirname, 'templates/description.art'), {
                item,
            });
        await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const response3 = await got.post(host.concat('/action/PB2showAjaxAbstract'), {
                        cookieJar,
                        body: 'doi=' + item.doi,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'Accept-Encoding': 'gzip, deflate, br',
                        },
                    });
                    const $3 = cheerio.load(response3.data);
                    item.abstract = $3('span').text();
                    item.description = renderDesc(item);
                    return item;
                })
            )
        );
    }

    ctx.state.data = {
        title: jrnlName.concat(' - ', sec),
        link: jrnlUrl,
        item: list,
        allowEmpty: true,
    };
};
