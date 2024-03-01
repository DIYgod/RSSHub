const got = require('@/utils/got');
const cheerio = require('cheerio');
const config = require('@/config').value;
const path = require('path');
const { art } = require('@/utils/render');

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
    const items = $('div.Zd-p-Sc > div:nth-child(1) tr')
        .toArray()
        .map((e) => ({
            title: $(e).find('td.al a').text().trim(),
            link: $(e).find('td.al a').attr('href'),
            heatRate: $(e).find('td:nth-child(3)').text().trim(),
        }));
    const combinedTitles = items.map((item) => item.title).join('');
    const renderRank = art(path.join(__dirname, 'templates/rank.art'), { items });

    ctx.state.data = {
        title,
        link,
        item: [
            {
                title,
                link,
                description: renderRank,
                guid: combinedTitles,
            },
        ],
    };
};
