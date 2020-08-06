const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = ctx.params.url || 'video';
    const link = `https://www.pornhub.com/${url}`;

    const response = await got.get(link, {
        headers: {
            // set ua to "Safari" to get preview videos in mp4 format, instead of webm
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1 Safari/605.1.15',
        },
    });
    const $ = cheerio.load(response.data);
    const list = $('.nf-videos .videoBox');

    ctx.state.data = {
        title: $('title').text(),
        url: link,
        item:
            list &&
            list
                .map((_, e) => {
                    e = $(e);

                    return {
                        title: e.find('span.title a').text(),
                        link: `https://www.pornhub.com` + e.find('span.title a').attr('href'),
                        description: `<video controls loop src=${e.find('img').attr('data-mediabook')} poster=${e.find('img').attr('src')}>`,
                    };
                })
                .get(),
    };
};
