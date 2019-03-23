const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await axios({
        method: 'get',
        url: 'https://www.bookbang.jp/review',
        headers: {
            Referer: 'https://www.bookbang.jp/review',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.thumbnail_list li')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('.title')
                    .text(),
                link: $(this)
                    .find('.title>a')
                    .attr('href'),
                pubDate: new Date(
                    $(this)
                        .find('.date')
                        .text()
                ).toUTCString(),
                description: $(this)
                    .find('.title')
                    .text(),
            };
            return info;
        })
        .get();

    const result = await Promise.all(
      out.map(async (info) => {
        const title = info.title;
        const date = info.pubDate;
        const itemUrl = info.link;

        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
          return Promise.resolve(JSON.parse(cache));
        }

        const response = await axios.get(itemUrl);
        const $ = cheerio.load(response.data);
        $('.box_editor, .tags_list, .sns_sharebutton_list').remove();
        const description = $('.box_review_detail').html();

        const single = {
          title: title,
          link: itemUrl,
          description: description,
          pubDate: date,
        };
        ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
        return Promise.resolve(single);
      })
    );

    ctx.state.data = {
        title: 'BookBang Review',
        link: 'https://www.bookbang.jp/review',
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
