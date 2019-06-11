const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let type = 'new-releases';
    let title = 'New Releases';

    const sort = ctx.params.sort || 'date';

    switch (ctx.params.type) {
        case 'coming':
            type = 'coming-soon';
            title = 'Coming Soon';
            break;
        case 'all':
            type = 'available';
            title = 'All Releases';
            break;
    }

    const url = `https://www.metacritic.com/browse/games/release-date/${type}/${ctx.params.platform}/${sort}`;

    const response = await got({
        method: 'get',
        url,
    });
    const data = response.body;

    const $ = cheerio.load(data);
    const list = $('.list_products > li')
        .get()
        .slice(0, 10);

    const result = list.map((item) => {
        const $ = cheerio.load(item);
        return {
            title: $('.product_title').text(),
            url: 'https://www.metacritic.com' + $('.product_title > a').attr('href'),
            metascore: $('.brief_metascore').text(),
            userscore: $('.textscore').text(),
            date: $('.release_date > .data').text(),
        };
    });

    ctx.state.data = {
        title: `Metacritic ${ctx.params.platform} ${title}`,
        link: url,
        item: result.map((item) => ({
            title: `${item.metascore === 'tbd' ? '' : [item.metascore]} ${item.title}`,
            description: `Release Date: ${item.date} <br> Metacritic Score: ${item.metascore} <br> User Score: ${item.userscore} <br>`,
            link: item.url,
        })),
    };
};
