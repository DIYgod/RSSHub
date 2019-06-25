const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `http://changba.com/u/${userid}`;
    const response = await got.get(url);

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#work_list li').get();
    const author = $('.userPage-user-name').text();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);
        return $.html('audio');
    };

    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const $a = $('a');
            const link = 'http://changba.com' + $a.attr('href');

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const reaponse = await got({
                method: 'get',
                url: link,
                headers: {
                    Referer: url,
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                },
            });

            const description = ProcessFeed(reaponse.data);

            const single = {
                title: $a.text(),
                description,
                link: link,
                author: author,
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
    };
};
