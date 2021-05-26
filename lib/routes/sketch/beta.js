const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got.get('https://www.sketch.com/beta/');
    const data = response.data;
    const $ = cheerio.load(data);
    // 获取版本
    const version = $('.small.beta__release-info')
        .text()
        .replace(/\)\s.*/, ')');

    const item = [
        {
            title: version,
            description: $('.beta__release-notes').html(),
            link: `https://www.sketch.com/beta/`,
            pubDate: new Date($('.beta__release-info time').text()),
            guid: version,
        },
    ];

    ctx.state.data = {
        title: `Sketch Beta`,
        link: 'https://www.sketch.com/beta/',
        description: 'Sketch is a design toolkit built to help you create your best work — from your earliest ideas, through to final artwork.',
        image: 'https://cdn.sketchapp.com/assets/components/block-buy/logo.png',
        item,
    };
};
