const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const url = `https://trakt.tv/users/${ctx.params.username}/collection/${ctx.params.type || 'all'}/added`;

    const response = await got(url);
    const $ = cheerio.load(response.data);

    const title = $('title').html();
    const list = $('.posters .grid-item').get();

    ctx.state.data = {
        title,
        link: url,
        item: list.map((single) => {
            const item = $(single);
            const title = item.find('.titles > h3').text();
            const link = item.find('meta[itemprop="url"]').attr('content');
            const poster = item.find('.poster > meta').attr('content');
            const pubDate = new Date(item.find('.titles .format-date').attr('data-date'));
            return {
                title,
                link,
                author: ctx.params.username,
                description: `<img src="${poster}" style="max-width: 100%;" >`,
                pubDate,
            };
        }),
    };
};
