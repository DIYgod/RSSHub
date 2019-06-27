const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `http://changba.com/u/${userid}`;
    const response = await got({
        method: 'get',
        url: url,
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('.user-work .work-info').get();
    const author = $('div.user-main-info > span.txt-info > a.uname').text();
    const authorimg = $('div.user-main-info > .poster > img').attr('data-src');

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        const description = $('.user-title').html() + '<br>' + $.html('audio');
        const mp3 = $('audio').attr('src');
        return { description, mp3 };
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const link = $('a').attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: url,
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                },
            });

            const result = ProcessFeed(response.data);

            const single = {
                title: $('.work-title').text(),
                description: result.description,
                link: link,
                author: author,
                itunes_item_image: authorimg,
                enclosure_url: result.mp3,
                enclosure_type: 'audio/mpeg',
            };
            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        item: items,
        image: authorimg,
        itunes_author: author,
        itunes_category: '唱吧',
    };
};
