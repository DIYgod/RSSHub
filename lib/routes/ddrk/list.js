const got = require('@/utils/got');
const cheerio = require('cheerio');
const md5 = require('@/utils/md5');

module.exports = async (ctx) => {
    const url = ctx.params.tag ? `https://ddrk.me/tag/${encodeURIComponent(ctx.params.tag)}/` : ctx.params.category ? `https://ddrk.me/category/${ctx.params.category}/` : 'https://ddrk.me/';

    const response = await got(url);
    const $ = cheerio.load(response.data);

    const title = $('title').html();
    const list = $('.post-box-list .post-box-container').toArray();

    ctx.state.data = {
        title,
        link: url,
        item: list.map((single, index) => {
            const item = $(single);
            const name = item.find('.post-box-title').text();
            const poster = item
                .find('.post-box-image')
                .attr('style')
                .match(/url\((.*?)\)/)[1];
            const text = item.find('.post-box-text p').html();
            const time = new Date();
            time.setMinutes(time.getMinutes() - index);
            return {
                title: name,
                author: '低端影视',
                description: `<img src="${poster}" style="max-width: 100%;" >${text ? text : ''}`,
                link: item.find('.post-box-title a').attr('href'),
                pubDate: time,
                guid: md5(name),
            };
        }),
    };
};
