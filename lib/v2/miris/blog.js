const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = 'https://blog.miris.design/';

    ctx.state.data = await buildData({
        link,
        url: link,
        title: 'Miris Whisper',
        author: 'Miris',
        description: 'Esoteric technical and sometimes personal stuff...',
        item: {
            item: 'ul > li',
            title: `$('li > a').contents().filter(function () { return this.type === 'text' }).text()`,
            link: `$('li > a').attr('href')`,
            pubDate: `parseDate($('li > a > .date').text().slice(1, 11))`,
        },
    });
};
