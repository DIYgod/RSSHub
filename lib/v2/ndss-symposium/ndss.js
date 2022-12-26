const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.ndss-symposium.org';
const { parseDate } = require('@/utils/parse-date');
// 2 sytles:
// * https://www.ndss-symposium.org/ndss2022/accepted-papers/
// * https://www.ndss-symposium.org/ndss2021/accepted-papers/

module.exports = async (ctx) => {
    const last = new Date().getFullYear() + 1;
    const yearList = Array.from({ length: last - 2020 }, (_, v) => `${url}/ndss${v + 2020}/accepted-papers`);
    const reponses = await got.all(yearList.map((url) => got(url)));

    const items = reponses.map((response) => {
        const $ = cheerio.load(response.data);
        const link = response.url;

        // both 2 styles have section.new-wrapper so we need to use another element to identify
        // here I use `.page-template-default`
        const paperSection = $('.page-template-default section.new-wrapper p')
            .toArray()
            .slice(1) // skip the header
            .map((item) => {
                item = $(item);
                const title = item.find('strong').text().trim();
                return {
                    title,
                    author: item.html().trim().split('</strong>')[1].trim().replaceAll('\n', '').replace(/\s+/g, ' '),
                    link: `${link}#${title}`,
                    pubDate: parseDate(link.match(/ndss(\d{4})/)[1], 'YYYY'),
                };
            });
        const paperTable = $('div.single-paper')
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('h3').text().trim();
                return {
                    title,
                    author: item.find('div.inner-wrap p').text().trim().replaceAll('\n', '').replace(/\s+/g, ' '),
                    link: item.find('p.paper-link-abs a').attr('href'),
                    pubDate: parseDate(link.match(/ndss(\d{4})/)[1], 'YYYY'),
                };
            });
        return paperSection.length ? paperSection : paperTable;
    });

    ctx.state.data = {
        title: 'NDSS',
        link: url,
        description: 'The Network and Distributed System Security (NDSS) Symposium Accpeted Papers',
        allowEmpty: true,
        item: items.flat(),
    };
};
