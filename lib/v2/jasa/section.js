const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');

module.exports = async (ctx) => {
    const host = 'https://asa.scitation.org/toc/jas/';
    const hostUrl = host.concat('current?size=all');
    const res = await got('https://asa.scitation.org');
    const cookie = res.headers['set-cookie'].join(' ');

    const currResponse = await got({
        method: 'get',
        url: hostUrl,
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
            cookie,
        },
    });
    const $1 = cheerio.load(currResponse.data);
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
            headers: {
                'Accept-Encoding': 'gzip, deflate, br',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.81 Safari/537.36',
                cookie,
            },
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
                        url: 'https://asa.scitation.org/action/PB2showAjaxAbstract',
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.40 Safari/537.36',
                            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                            'Accept-Encoding': 'gzip, deflate, br',
                            cookie,
                        },
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
