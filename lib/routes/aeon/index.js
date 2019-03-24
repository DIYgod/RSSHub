const axios = require('../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const baseUrl = 'https://aeon.co';

module.exports = async (ctx) => {
    const id = ctx.params.id;

    if(id=='home'){
      host = baseUrl;
    } else {
      host = `${baseUrl}/${id}`;
    }

    const response = await axios({
        method: 'get',
        url: host,
        headers: {
            Referer: host,
        },
    });
    
    const data = response.data;
    const $ = cheerio.load(data);

    const out = $('.article-card__contents')
        .slice(0, 10)
        .map(function() {
            const info = {
                title: $(this)
                    .find('.article-card__title')
                    .text(),
                link: url.resolve(baseUrl, $(this)
                    .find('.article-card__title')
                    .attr('href')),
            };
            return info;
        })
        .get();

    const result = await Promise.all(
      out.map(async (info) => {
        const title = info.title;
        const itemUrl = info.link;

        const cache = await ctx.cache.get(itemUrl);
        if (cache) {
          return Promise.resolve(JSON.parse(cache));
        }

        const response = await axios.get(itemUrl);
        const $ = cheerio.load(response.data);
        $('.article__inline-sidebar, .republish-button').remove();
        const description = $('.article__body__content').html();

        const single = {
          title: title,
          link: itemUrl,
          description: description,
          pubDate: new Date($('.article__date').text()).toUTCString(),
        };
        ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
        return Promise.resolve(single);
      })
    );

    ctx.state.data = {
        title: 'Aeon ' + `${id}`,
        link: `https://aeon.co/${id}`,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};
