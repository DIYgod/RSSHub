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
    const $1 = cheerio.load(curtResponse.data);
    const baseUrl = $1('.row.js_issue.highlighted').find('a').attr('href');
    const heading = $1('.subject-heading')
        .map((_, item) => ({
            section: $1(item).text(),
        }))
        .get();

    let list;
    let ifContainSection = false;
    const id = ctx.params.id.split('+').join(' ');
    for (let i = 0, l = heading.length; i < l; i++) {
        if (heading[i].section === id) {
            ifContainSection = true;
        }
    }
    if (ifContainSection === true) {
        const sectUrl = baseUrl.concat('?tocSection=', id);
        const response = await got({
            method: 'get',
            url: sectUrl,
            headers,
        });
        const $ = cheerio.load(response.data);
        list = $('.card')
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
    }

    ctx.state.data = {
        title: 'JASA - '.concat(id),
        link: hostUrl,
        item: list,
        allowEmpty: true,
    };
};
