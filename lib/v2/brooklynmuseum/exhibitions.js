const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    let link;
    const state = ctx.params.state;

    switch (state) {
        case undefined:
        case 'current':
            link = 'https://www.brooklynmuseum.org/exhibitions/';
            break;
        default:
            link = `https://www.brooklynmuseum.org/exhibitions/${state}`;
    }

    ctx.state.data = await buildData({
        link,
        url: link,
        title: 'Brooklyn Museum - Exhibitions',
        item: {
            item: '.exhibitions .image-card',
            title: `$('h2 > a, h3 > a').text()`,
            link: `$('h2 > a, h3 > a').attr('href')`,
            description: `$('h6').text()`,
        },
    });
};
