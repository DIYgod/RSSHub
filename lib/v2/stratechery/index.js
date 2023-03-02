const buildData = require('@/utils/common-config');

module.exports = async (ctx) => {
    const link = 'https://stratechery.com/';

    ctx.state.data = await buildData({
        link,
        url: link,
        title: 'Stratechery by Ben Thompson',
        author: 'Ben Thompson',
        description: 'Stratechery provides analysis of the strategy and business side of technology and media, and the impact of technology on society. ',
        item: {
            item: 'article',
            title: `$('article > header > h1 > a').text()`,
            link: `$('article > header > h1 > a').attr('href')`,
            pubDate: `parseDate($('article .entry-date').attr('datetime'))`,
            description: `$('article > .entry-content').html().replace(/%/g, '&percnt;')`,
        },
    });
};
