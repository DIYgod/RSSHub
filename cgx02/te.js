const got = require('got');
const cheerio = require('cheerio');
module.exports = async (ctx) => {
    const url = `http://www.cgx02.xyz/index.php?dir=/te`;
    const response = await got({
        method: 'get',
        url: url,
    });
    const $ = cheerio.load(response.body);

    const item = $('tr')
        .map(function () {
            return {
                title: $(this).find('td:first-child a').text(),
                description: $(this).find('td:first-child a').text(),
                link: /.\//.test($(this).find('td:first-child a').attr('href')) ? $(this).find('td:first-child a').attr('href').replace(/.\//, 'http://www.cgx02.xyz/') : $(this).find('td:first-child a').attr('href'),
                pubDate: $(this).find('td:nth-child(3)').text(),
            };
        })
        .get();

    ctx.state.data = {
        title: 'Zdir',
        link: 'http://www.cgx02.xyz/index.php?dir=/te',
        item: item,
    };
};
