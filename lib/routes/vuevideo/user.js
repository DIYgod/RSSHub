const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `https://m.vuevideo.net/share/user/${userid}`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const data = response.data;
    const $ = cheerio.load(data);
    const list = $('#hotVideosUl li').get();
    const author = $('.infoItem.name').text();

    const ProcessFeed = (data) => {
        const $ = cheerio.load(data);

        $('#openBtn').html('APP播放');

        // 提取内容
        return $('.videoContainer').html() + '<br>' + $('.footer').html();
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
            });

            const description = ProcessFeed(response.data);

            const single = {
                title: $('.videoTitle').text(),
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
        description: $('meta[property="og:description"]').attr('content') || $('title').text(),
        item: items,
    };
};
