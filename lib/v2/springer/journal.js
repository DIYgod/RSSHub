const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const host = 'https://www.springer.com';
    const journal = ctx.params.journal;
    const jrnlUrl = `${host}/journal/${journal}`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);
    const jrnlName = $('h1#journalTitle').text().trim();
    const issueUrl = $('p.c-card__title.u-mb-16.u-flex-grow').find('a').attr('href');

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = cheerio.load(response2.data);
    const issue = $2('.app-volumes-and-issues__info').find('h1').text();
    const list = $2('article.c-card')
        .map((_, item) => {
            const title = $(item).find('.c-card__title').text().trim();
            const link = $(item).find('a').attr('href');
            const doi = link.replace('https://link.springer.com/article/', '');
            const img = $(item).find('img').attr('src');
            const authors = $(item)
                .find('.c-author-list')
                .find('li')
                .map((_, item) => $(item).text().trim())
                .get()
                .join('; ');
            return {
                title,
                link,
                doi,
                issue,
                img,
                authors,
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
                const response3 = await got(item.link, {
                    cookieJar,
                });
                const $3 = cheerio.load(response3.data);
                $3('.c-article__sub-heading').remove();
                item.abstract = $3('div#Abs1-content').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );
    ctx.state.data = {
        title: jrnlName,
        link: jrnlUrl,
        item: list,
    };
};
