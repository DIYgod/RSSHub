const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let response = await got.get('https://www.thunderbird.net/en-US/thunderbird/releases/');
    let data = response.data;
    let $ = cheerio.load(data);

    const version = $('.flex-1.p-3').first().find('a').last().text();

    response = await got.get(`https://www.thunderbird.net/en-US/thunderbird/${version}/releasenotes/`);
    data = response.data;
    $ = cheerio.load(data);
    $('main section:last-child').remove();
    const content = $('main').html();

    ctx.state.data = {
        title: 'Thunderbird release note',
        link: 'https://www.thunderbird.net/',
        item: [
            {
                title: ['Thunderbird', version, 'release'].join(' '),
                guid: version,
                link: ['https://www.thunderbird.net/en-US/thunderbird/', version, '/releasenotes'].join(''),
                description: content,
            },
        ],
    };
};
