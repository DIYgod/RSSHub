const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const host = 'https://www.sciencedirect.com';
    const journal = ctx.params.journal;
    const hostUrl = host.concat('/journal/', journal);
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

    const preResponse = await got({
        method: 'get',
        url: hostUrl,
        headers,
    });
    const $1 = cheerio.load(preResponse.data);
    const jrnlName = $1('.anchor.js-title-link').text();
    const ltstUrl = host.concat($1('.anchor.js-volume').attr('href'));
    let volume = '';
    if (ltstUrl.match('suppl') !== null) {
        volume = 'Volume ' + ltstUrl.match('vol/(.*)/suppl')[1];
    } else if (ltstUrl.match('issue') !== null) {
        volume = 'Volume ' + ltstUrl.match('vol/(.*)/issue')[1] + ' Issue ' + ltstUrl.match('/issue/(.*)')[1];
    }

    const response = await got({
        method: 'get',
        url: ltstUrl,
        headers,
    });
    const $ = cheerio.load(response.data);
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
                    url: host.concat('/science/article/pii/', item.id),
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
        title: jrnlName.concat(' - Latest'),
        link: hostUrl,
        item: list,
    };
};
