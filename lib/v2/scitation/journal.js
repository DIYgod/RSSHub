const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const pub = ctx.params.pub;
    const jrn = ctx.params.jrn;
    const host = `https://${pub}.scitation.org`;
    const jrnlUrl = `${host}/toc/${jrn}/current?size=all`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);
    const jrnlName = $('.header-journal-title').text();
    const list = $('.card')
        .map((_, item) => {
            $(item).find('.access-text').remove();
            const title = $(item).find('.hlFld-Title').text();
            const authors = $(item).find('.entryAuthor.all').text();
            const img = $(item).find('img').attr('src');
            const link = $(item).find('.ref.nowrap').attr('href');
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
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const response2 = await got.post(`${host}/action/PB2showAjaxAbstract`, {
                    cookieJar,
                    body: 'doi=' + item.doi,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'Accept-Encoding': 'gzip, deflate, br',
                    },
                });
                const $2 = cheerio.load(response2.data);
                item.abstract = $2('span').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: jrnlName,
        link: jrnlUrl,
        item: items,
    };
};
