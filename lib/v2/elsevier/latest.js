const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const resp = await got('https://www.sciencedirect.com');
    const cookie = resp.headers['set-cookie'].join(' ');
    const journal = ctx.params.journal;
    const hostUrl = 'https://www.sciencedirect.com/journal/' + journal;

    const hostResponse = await got({
        method: 'get',
        url: hostUrl,
        headers: {
            Host: 'www.sciencedirect.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            Referer: 'https://id.elsevier.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            cookie,
        },
    });

    const $host = cheerio.load(hostResponse.data);
    const jrnlName = $host('.anchor.js-title-link').text();
    const ltstUrl = 'https://www.sciencedirect.com' + $host('.anchor.js-volume').attr('href');
    let volume = '';
    if (ltstUrl.match('suppl') !== null) {
        volume = 'Volume ' + ltstUrl.match('vol/(.*)/suppl')[1];
    } else if (ltstUrl.match('issue') !== null) {
        volume = 'Volume ' + ltstUrl.match('vol/(.*)/issue')[1] + ' Issue ' + ltstUrl.match('/issue/(.*)')[1];
    }

    const ltstResponse = await got({
        method: 'get',
        url: ltstUrl,
        headers: {
            Host: 'www.sciencedirect.com',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            Referer: 'https://id.elsevier.com/',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'zh-CN,zh;q=0.9',
            cookie,
        },
    });

    const $ = cheerio.load(ltstResponse.data);

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
                    headers: {
                        Host: 'www.sciencedirect.com',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.54 Safari/537.36',
                        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        Referer: 'https://id.elsevier.com/',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        cookie,
                    },
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
