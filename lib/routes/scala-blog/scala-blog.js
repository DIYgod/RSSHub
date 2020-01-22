const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx, next) => {
    const part = ctx.params.part || '';
    const link = `https://scala-lang.org/blog/${part}`;
    const host = 'https://scala-lang.org';

    const resp = await got(link);
    const $ = cheerio.load(resp.body);
    const items = $('.blog-item')
        .get()
        .map((item) => {
            const $ = cheerio.load(item);
            const aTag = $('a').first();
            return {
                title: aTag.text(),
                link: host + aTag.attr('href'),
                pubDate: new Date($('.blog-date').text()),
            };
        });

    ctx.state.data = {
        title: `Scala Blog ${part === '' ? 'all' : part} Section `,
        link,
        item: items,
    };
    await next();
};
