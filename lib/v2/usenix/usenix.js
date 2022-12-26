const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.usenix.org';

const seasons = ['spring', 'summer', 'fall', 'winter'];

module.exports = async (ctx) => {
    const last = new Date().getFullYear() + 1;
    const urlList = Array.from({ length: last - 2020 }, (_, v) => `${url}/conference/usenixsecurity${v + 20}`)
        .map((url) => seasons.map((season) => `${url}/${season}-accepted-papers`))
        .flat();
    const responses = await got.all(
        urlList.map(async (url) => {
            let res;
            try {
                res = await got(url);
            } catch (e) {
                // ignore 404
            }
            return res;
        })
    );

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
