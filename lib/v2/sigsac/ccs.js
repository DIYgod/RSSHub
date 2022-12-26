const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.sigsac.org/';
// https://www.sigsac.org/ccs/CCS2022/program/accepted-papers.html

module.exports = async (ctx) => {
    const last = new Date().getFullYear() + 1;
    const yearList = Array.from({ length: last - 2020 }, (_, v) => `${url}ccs/CCS${v + 2020}/`);
    const yearResponses = await got.all(yearList.map((url) => got(url)));

    const urlList = yearResponses.map((response) => {
        const $ = cheerio.load(response.data);
        return new URL($('a:contains("Accepted Papers")').attr('href'), response.url).href;
    });

    const responses = await got.all(urlList.map((url) => got(url)));

    // Iterate accpeted papers urls
    promises = [];
    await Promise.all(
        urls.map((url) =>
            got
                .get(url)
                .then((response) => response.body)
                .catch((e) => {
                    // ignore 404
                    /* deepscan-disable */
                    // eslint-disable-next-line no-use-before-define
                    e;
                })
        )
    ).then((resArray) => {
        resArray.forEach((res) => {
            const $ = cheerio.load(res);
            const articles = $('div.papers-item').get();
            items.push(
                ...articles.map((article) => {
                    const item = $(article);
                    const title = item.find('b').text().trim();
                    const authors = item.find('p').text().trim().replaceAll('\n', '').replace(/\s+/g, ' ');
                    return { title, authors };
                })
            );
        });
    });

    ctx.state.data = {
        title: 'ACM CCS',
        link: url,
        description: 'The ACM Conference on Computer and Communications Security (CCS) Accepted Papers',
        allowEmpty: true,
        item: items,
    };
};
