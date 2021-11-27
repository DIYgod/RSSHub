const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const host = 'https://www.sciencedirect.com';
    const journal = ctx.params.journal;
    const volume = 'Volume ' + ctx.params.id.replace('-', ' Issue ');
    const volUrl = 'https://www.sciencedirect.com/journal/' + journal + '/vol/' + ctx.params.id.replace('-', '/issue/');
    const resp = await got(host);
    const cookie = resp.headers['set-cookie'].join(' ');
    const headers = {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        Referer: 'https://id.elsevier.com/',
        Host: host.replace('https://', ''),
        'User-Agent': config.ua,
        cookie,
    };

    const response = await got({
        method: 'get',
        url: volUrl,
        headers,
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
                volume,
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
                const itemResponse = await got({
                    method: 'get',
                    url: 'https://www.sciencedirect.com/science/article/pii/' + item.id,
                    headers,
                });
                const content = cheerio.load(itemResponse.data);
                content('.section-title').remove();
                const doi = content('.doi').attr('href').replace('https://doi.org/', '');
                item.doi = doi;
                item.abstract = content('.abstract.author').html();
                item.description = renderDesc(item);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: jrnlName.concat(' - ', volume),
        link: volUrl,
        item: list,
    };
};
