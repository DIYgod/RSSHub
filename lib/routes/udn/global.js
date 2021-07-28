const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    let filter, url, tag;
    if (ctx.params.tid !== 'newest') {
        url = `https://global.udn.com/search/tagging/1020/${ctx.params.tid}`;
        filter = 'li.contentli';
        tag = ctx.params.tid;
    } else {
        url = `https://global.udn.com/global_vision/index`;
        filter = `.news_cards > ul > li`;
        tag = '最新文章';
    }
    const res = await got.get(url);
    const $ = cheerio.load(res.data);
    const list = $(filter).get();

    const out = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            let title;
            let address = $('a').attr('href');
            if (ctx.params.tid === 'newest') {
                address = `https://global.udn.com` + address;
                title = $('h3').text();
            } else {
                title = $('h2').text();
            }
            const time = $('span.date').text();
            const author = $('span.author').text();
            const cache = await ctx.cache.get(address);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }
            const res = await got.get(address);
            const capture = cheerio.load(res.data);
            capture('div.social_bar').remove();
            capture('div.area').remove();
            capture('.story_art_title').remove();
            capture('.story_bady_info_author').remove();
            capture('.photo_pop').remove();
            const contents = capture('div.story_body_content').html();
            const single = {
                title: title,
                author: author,
                description: contents,
                link: address,
                guid: address,
                pubDate: new Date(time).toUTCString(),
            };
            ctx.cache.set(address, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `轉角國際 | ${tag}`,
        link: url,
        item: out,
    };
};
