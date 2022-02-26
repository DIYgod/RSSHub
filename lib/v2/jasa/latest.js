const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const host = 'https://asa.scitation.org';
    const hostUrl = host.concat('/toc/jas/current?size=all');
    const resp = await got(host);
    const cookie = resp.headers['set-cookie'].join(' ');
    const headers = {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': config.ua,
        cookie,
    };

    const curtResponse = await got({
        method: 'get',
        url: hostUrl,
        headers,
    });
    const $ = cheerio.load(curtResponse.data);
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
    await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const itemResponse = await got({
                    method: 'post',
                    url: host.concat('/action/PB2showAjaxAbstract'),
                    headers,
                    body: 'doi=' + item.doi,
                });
                const content = cheerio.load(itemResponse.data);
                item.abstract = content('span').text();
                item.description = renderDesc(item);
                return item;
            })
        )
    );

    ctx.state.data = {
        title: 'JASA - Latest',
        link: hostUrl,
        item: list,
    };
};
