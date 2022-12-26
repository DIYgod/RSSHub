const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.usenix.org';

const seasons = ['spring', 'summer', 'fall', 'winter'];

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
                        // ignore 404
                        /* deepscan-disable */
                        // eslint-disable-next-line no-use-before-define
                        e;
                    })
            )
        );
    }

    const list = responses
        .filter((element) => element)
        .map((response) => {
            const $ = cheerio.load(response.data);
            const pubDate = parseDate($('meta[property=article:modified_time]').attr('content'));
            return $('article.node-paper')
                .toArray()
                .map((item) => {
                    item = $(item);
                    return {
                        title: item.find('h2.node-title > a').text().trim(),
                        link: `${url}${item.find('h2.node-title > a').attr('href')}`,
                        author: item.find('div.field.field-name-field-paper-people-text.field-type-text-long.field-label-hidden p').text().trim(),
                        pubDate,
                    };
                });
        })
        .flat();
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
        title: 'USENIX Security Symposium',
        link: url,
        description: 'USENIX Accpeted Papers',
        allowEmpty: true,
        item: items,
    };
};
