const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://bbs.zhibo8.cc/forum/list/?fid=${id}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('div.intro > h2').text();
    const list = $('table.topic-list > tbody:nth-child(3) > tr');

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const title = item.find('td:nth-child(1) > a:nth-child(2)').text();
                const author = item.find('td:nth-child(2) cite a').text();
                const date = item.find('td:nth-child(2) em').text();
                const link = 'https://bbs.zhibo8.cc' + item.find('td:nth-child(1) > a:nth-child(2)').attr('href');

                const single = {
                    title,
                    author,
                    link,
                    pubDate: new Date(date).toUTCString(),
                };

                const key = link;
                const value = await ctx.cache.get(key);
                if (value) {
                    single.description = value;
                } else {
                    const response = await got.get(link);
                    const $ = cheerio.load(response.data);
                    $('.detail_ent img').each(function () {
                        const $img = $(this);
                        const src = $img.attr('src');
                        $img.attr('src', 'https:' + src);
                    });
                    single.description = $('.detail_ent').html();
                    ctx.cache.set(key, single.description);
                }
                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title: `${title}—直播吧`,
        link,
        item: out,
    };
};
