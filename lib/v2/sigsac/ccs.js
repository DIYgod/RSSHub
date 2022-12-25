const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.sigsac.org/';
// https://www.sigsac.org/ccs/CCS2022/program/accepted-papers.html

module.exports = async (ctx) => {
    const items = [];
    let promises = [];
    const urls = [];

    const last = new Date().getFullYear() - 2000 + 1;

    // Get accpeted papers url from index page
    for (let index = 20; index < last; index++) {
        promises.push(
            got
                .get(`${url}/ccs/CCS20${index}/`)
                .then((response) => response.body)
                .catch((e) => {
                    // ignore 404
                    /* deepscan-disable */
                    // eslint-disable-next-line no-use-before-define
                    e;
                })
        );
    }

    let urlArray = await Promise.all(promises).then((res) => res);
    promises = [];
    urlArray = urlArray.filter((element) => element !== undefined);
    urlArray.forEach((res) => {
        const $ = cheerio.load(res);
        urls.push($('a:contains("Accepted Papers")').attr('href'));
    });

    // Format urls
    for (let index = 20; index < last; index++) {
        urls[index - 20] = new URL(urls[index - 20], `${url}/ccs/CCS20${index}/`);
    }

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
