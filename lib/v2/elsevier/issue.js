const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

const { CookieJar } = require('tough-cookie');
const cookieJar = new CookieJar();

module.exports = async (ctx) => {
    const journal = ctx.params.journal;
    const issue = 'Volume ' + ctx.params.issue.replace('-', ' Issue ');
    const host = 'https://www.sciencedirect.com';
    const issueUrl = `${host}/journal/${journal}/vol/${ctx.params.issue.replace('-', '/issue/')}`;

    const response = await got(issueUrl, {
        cookieJar,
    });
    const $ = cheerio.load(response.data);
    const jrnlName = $('.anchor.js-title-link').text();
    const list = $('.js-article')
        .map((_, item) => {
            const title = $(item).find('.js-article-title').text();
            const authors = $(item).find('.js-article__item__authors').text();
            const link = $(item).find('.article-content-title').attr('href');
            const id = $(item).find('.article-content-title').attr('id');
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
                const response2 = await got(`${host}/science/article/pii/${item.id}`, {
                    cookieJar,
                });

                const $2 = cheerio.load(response2.data);
                $2('.section-title').remove();
                item.doi = $2('.doi').attr('href').replace('https://doi.org/', '');
                item.abstract = $2('.abstract.author').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${jrnlName} - ${issue}`,
        link: issueUrl,
        item: list,
    };
};
