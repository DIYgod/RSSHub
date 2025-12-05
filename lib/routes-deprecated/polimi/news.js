const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    let link = `https://www.polimi.it/tutte-le-news/`;
    if (ctx.params.language === 'en') {
        link = `https://www.polimi.it/en/all-news/`;
    }
    ctx.state.data = await buildData({
        link,
        url: link,
        title: `Polimi News`,
        params: {
            homeLink: 'https://www.polimi.it',
        },
        item: {
            item: '.container .no',
            title: `$('h3').text()`,
            link: `'%homeLink%' + $('p span a').attr('href')`,
            description: `$('p').text() + '<p></p>' + '<a href="' + '%homeLink%' + $('p span a').attr('href') + '">Full Article</a'`,
        },
    });
};
