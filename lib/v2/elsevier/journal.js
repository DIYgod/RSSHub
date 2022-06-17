const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const journal = ctx.params.journal;
    const host = 'https://www.sciencedirect.com';
    const jrnlUrl = `${host}/journal/${journal}`;

    const response = await got(jrnlUrl, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);
    const jrnlName = $('.anchor.js-title-link').text();
    const issueUrl = `${host}${$('.anchor.js-volume').attr('href')}`;
    let issue = '';
    if (issueUrl.match('suppl') !== null) {
        issue = 'Volume ' + issueUrl.match('vol/(.*)/suppl')[1];
    } else if (issueUrl.match('issue') !== null) {
        issue = 'Volume ' + issueUrl.match('vol/(.*)/issue')[1] + ' Issue ' + issueUrl.match('/issue/(.*)')[1];
    }

    const response2 = await got(issueUrl, {
        cookieJar,
    });
    const $2 = cheerio.load(response2.data);
    const list = $2('.js-article')
        .map((_, item) => {
            const title = $2(item).find('.js-article-title').text();
            const authors = $2(item).find('.js-article__item__authors').text();
            const link = $2(item).find('.article-content-title').attr('href');
            const id = $2(item).find('.article-content-title').attr('id');
            return {
                title,
                link,
                id,
                authors,
                issue,
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
                const response3 = await got(`${host}/science/article/pii/${item.id}`, {
                    cookieJar,
                });
                const $3 = cheerio.load(response3.data);
                $3('.section-title').remove();
                item.doi = $3('.doi').attr('href').replace('https://doi.org/', '');
                item.abstract = $3('.abstract.author').text();
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
