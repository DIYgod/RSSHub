const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    let link;
    const state = ctx.query.state;

    switch (state) {
        case undefined:
        case 'current':
            link = 'https://www.newmuseum.org/exhibitions/';
            break;
        default:
            link = `https://www.newmuseum.org/exhibitions/${state}`;
    }

    ctx.state.data = await buildData({
        link,
        url: link,
        title: 'New Museum - Exhibitions',
        item: {
            item: '.exh',
            title: `$('.exh .title').text()`,
            link: `$('.exh > a').attr('href')`,
            description: `$('.exh .body-reveal').text()`,
        },
    });
};
