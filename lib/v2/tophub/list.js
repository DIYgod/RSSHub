const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://tophub.today/n/${id}`;
    const response = await got.get(link, {
        headers: {
            Referer: 'https://tophub.today',
            Cookie: config.tophub.cookie,
        },
    });
    const $ = cheerio.load(response.data);
    const title = $('div.Xc-ec-L.b-L').text().trim();
    let rank = `<ul>`;
    let idx = 1;
    let content = '';
    $('div.Zd-p-Sc > div:nth-child(1) tr')
        .toArray()
        .forEach((e) => {
            const info = {
                title: $(e).find('td.al a').text().trim(),
                link: $(e).find('td.al a').attr('href'),
                heatRate: $(e).find('td:nth-child(3)').text().trim(),
            };
            rank += `<li>${idx}. <a href="${info.link}">${info.title}</a> ${info.heatRate}</li>`;
            content += info.title;
            idx++;
        });
    rank += '</ul>';

    ctx.state.data = {
        title,
        link,
        item: [
            {
                title,
                link,
                description: rank,
                guid: content,
            },
        ],
    };
};
