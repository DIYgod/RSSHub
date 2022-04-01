const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = `https://thejewishmuseum.org/exhibitions`;

    ctx.state.data = await buildData({
        link,
        url: link,
        title: `Jewish Museums - Exhibitions`,
        item: {
            item: 'article',
            title: `$('article.exhibition h3').text()`,
            link: `$('article.exhibition > a').attr('href')`,
        },
    });
};
