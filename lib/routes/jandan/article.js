const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://jandan.net/',
    });
    const $ = cheerio.load(response.data);
    const list = $('div.list-post').get();

    const items = await Promise.all(
        list.map(async (li) => {
            const $ = cheerio.load(li);
            const link = $('a').first().attr('href');
            const title = $('a')[1].children[0].data;
            const summary = $('div.indexs').clone().children().remove().end().text().trim();
            const author = $('div.time_s > a').first().text();
            let imgUrl = 'http:' + ($('img').attr('src') || $('img').attr('data-original'));
            if (imgUrl.slice(-7) === '!square') {
                imgUrl = imgUrl.slice(0, -7);
            }

            const [fullText, time] = await ctx.cache.tryGet(link, async () => {
                const res = await got.get(link);
                const $ = cheerio.load(res.data);
                const [, year, month, day, hour, minute] = $('div.time_s')
                    .text()
                    .match(/.+@\s+(\d+)\.(\d+)\.(\d+)\s,\s(\d+):(\d+)/);
                const time = new Date(`${year}-${month}-${day}T${hour}:${minute}:00+0800`).toUTCString();

                const content = $('.f.post').first();
                content.find('h1').prevAll().remove().end().remove();
                content.find('div').nextAll().remove().end().remove();
                content.contents().each(function () {
                    if (this.nodeType === 8) {
                        $(this).remove();
                    }
                });
                const text = content.html().trim();

                return [text, time];
            });
            const description = `<blockquote><p>${summary}</p></blockquote><img src="${imgUrl}">${fullText}`;

            const single = {
                title: title,
                description: description,
                link: link,
                pubDate: time,
                author: author,
            };
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `煎蛋 - 首页`,
        link: `http://jandan.net/`,
        description: '煎蛋 - 地球上没有新鲜事',
        item: items,
    };
};
