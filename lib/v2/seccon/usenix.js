const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.usenix.org/';

const list = ['spring-accepted-papers', 'summer-accepted-papers', 'fall-accepted-papers', 'winter-accepted-papers'];

module.exports = async (ctx) => {
    const items = [];
    let promises = [];

    const last = new Date().getFullYear() - 2000 + 1;

    for (let index = 20; index < last; index++) {
        // Some usenix may not have all four quarter sections
        // So we need to iterate through the four sections
        promises.push(
            ...list.map((suffix) =>
                got
                    .get(`${url}/conference/usenixsecurity${index}/${suffix}`)
                    .then((response) => response.body)
                    .catch((e) => {
                        // ignore 404 and just fix for stupid eslint
                        // eslint-disable-next-line no-use-before-define
                        e;
                    })
            )
        );
    }

    let resArray = await Promise.all(promises).then((res) => res);
    resArray = resArray.filter((element) => element !== undefined);
    promises = [];
    resArray.forEach((res) => {
        const $ = cheerio.load(res);
        const time = $('meta[property=article:modified_time]').attr('content');

        const articles = $('article.node-paper').get();
        promises.push(
            ...articles.map(async (article) => {
                const item = $(article);
                const title = item.find('h2.node-title > a').text().trim();
                const href = item.find('h2.node-title > a').attr('href');
                const authors = item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text();
                const response = await got.get(`${url}${href}`);
                const $$ = cheerio.load(response.body);
                const description = $$('div.field-name-field-paper-description > div.field-items > div').text().replaceAll('\n', '<br>');

                return {
                    title,
                    pubDate: new Date(time).toUTCString(),
                    link: `${url}${href}`,
                    author: authors,
                    description,
                };
            })
        );
    });
    await Promise.all(promises).then((res) => items.push(...res));

    ctx.state.data = {
        title: 'usenix',
        link: url,
        description: 'USENIX Accpeted Papers',
        allowEmpty: true,
        item: items,
    };
};
