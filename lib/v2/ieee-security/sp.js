const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.ieee-security.org/';
// https://www.ieee-security.org/TC/SP2023/program-papers.html

module.exports = async (ctx) => {
    const last = new Date().getFullYear() + 2;
    const urlList = Array.from({ length: last }, (_, v) => `${url}TC/SP${v + 2020}/program-papers.html`);
    const responses = await got.all(urlList.map((url) => got(url)));

    let resArray = await Promise.all(promises)
        .then((res) => res)
        .catch();
    resArray = resArray.filter((element) => element !== undefined);
    promises = [];
    resArray.forEach((res) => {
        const $ = cheerio.load(res);
        const articles = $('div.panel-body > div.list-group-item').get();
        promises.push(
            ...articles.map((article) => {
                // s&p doesn't have publish date...
                const item = $(article);
                const authors = item.html().trim().split('<br>')[1].trim();
                const title = item.find('b').text().trim();
                return { title, authors };
            })
        );
    });
    items = await Promise.all(promises).then((res) => items.concat(res));

    ctx.state.data = {
        title: 'S&P',
        link: url,
        description: 'IEEE Symposium on Security and Privacy Accepted Papers',
        allowEmpty: true,
        item: items,
    };
};
