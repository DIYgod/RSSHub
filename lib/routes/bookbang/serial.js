const axios = require('../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await axios({
        method: 'get',
        url: `https://www.bookbang.jp/${id}`,
        headers: {
            Referer: `https://www.bookbang.jp/${id}`,
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.box_content')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('.title')
                    .text(),
                link: $(this)
                    .find('.title>a')
                    .attr('href'),
                pubDate: $(this)
                        .find('.date')
                        .text(),
            };
            return info;
        })
        .get();

    const result = await Promise.all(
      out.map(async (info) => {
          const title = info.title;
          const date = new Date(info.pubDate).toUTCString();
          const itemUrl = info.link;

          const cache = await ctx.cache.get(itemUrl);
          if (cache) {
            return Promise.resolve(JSON.parse(cache));
          }

          const response = await axios.get(itemUrl);
          const $ = cheerio.load(response.data);
          $('.recommend_book_list, .tags_list, .sns_sharebutton_list').remove();
          const description = $('.content_body').html();

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
        title: $('meta[property="og:site_name"]').attr('content'),
        link: `https://www.bookbang.jp/${id}`,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};