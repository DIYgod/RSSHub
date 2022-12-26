const got = require('@/utils/got');
const cheerio = require('cheerio');
const url = 'https://www.sigsac.org/';
const { parseDate } = require('@/utils/parse-date');
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

    const items = responses.map((response) => {
        const $ = cheerio.load(response.data);
        const link = response.url;
        const paperSection = $('div.papers-item')
            .toArray()
            .map((item) => {
                item = $(item);
                const title = item.find('b').text().trim();
                return {
                    title,
                    author: item.find('p').text().trim().replaceAll('\n', '').replace(/\s+/g, ' '),
                    link: `${link}#${title}`,
                    pubDate: parseDate(link.match(/CCS(\d{4})/)[1], 'YYYY'),
                };
            });
        const paperTable = $('tbody tr')
            .toArray()
            .slice(1) // skip table header
            .map((item) => {
                item = $(item);
                const title = item.find('td').eq(0).text().trim();
                return {
                    title,
                    author: item.find('td').eq(1).text().trim().replaceAll('\n', '').replace(/\s+/g, ' '),
                    link: `${link}#${title}`,
                    pubDate: parseDate(link.match(/CCS(\d{4})/)[1], 'YYYY'),
                };
            });
        return paperSection.length ? paperSection : paperTable;
    });

    ctx.state.data = {
        title: 'ACM CCS',
        link: url,
        description: 'The ACM Conference on Computer and Communications Security (CCS) Accepted Papers',
        allowEmpty: true,
        item: items.flat(),
    };
};
