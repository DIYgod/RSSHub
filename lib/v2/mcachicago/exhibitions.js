const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = 'https://mcachicago.org/exhibitions';

    ctx.state.data = await buildData({
        link,
        url: link,
        title: 'MCA Chicago - Exhibitions',
        item: {
            item: '#exhibitions .card',
            title: `$('.title').text()`,
            link: `$('a').attr('href')`,
            // description: `$('a').html()`,
        },
    });
};
