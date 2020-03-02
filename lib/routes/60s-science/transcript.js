const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const url = `https://www.scientificamerican.com/podcast/60-second-science/`;

    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $('.underlined_text.t_small').get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const fullTitle = $(item).attr('aria-label');
            const title = fullTitle.substring(0, fullTitle.length - 11);
            const address = $(item).attr('href');
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);

            const tStr = '.article-header__divider > ul > li > span:nth-child(2)';
            const time = capture(tStr).text();
            const aStr = '.article-header__divider > ul > li > span:nth-child(1) > span';
            const author = capture(aStr).text();

            capture('.transcript__close').remove();
            const intro = capture('.article-media__object').html() + '<br><br>';
            const contents = intro + capture('.transcript__inner').html();
            const single = {
                title,
                description: contents,
                link: address,
                guid: address,
                author: author,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: 'Transcripts of SA 60-Second Science',
        link: url,
        item: out,
    };
};
