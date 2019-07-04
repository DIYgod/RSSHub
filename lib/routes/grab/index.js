const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

module.exports = async (ctx) => {
    ctx.params;

    const url = decodeURIComponent(ctx.params.url);
    const title = decodeURIComponent(ctx.params.title);

    const response = await got({
        method: 'get',
        url: url,
        responseType: 'buffer',
    });

    let data = iconv.decode(response.data, 'utf8');
    let $ = cheerio.load(data);
    let charset;
    if ($('meta[http-equiv="Content-Type"]').length) {
      charset = $('meta[http-equiv="Content-Type"]').attr('content').match(/charset=(.*)($|;)/)[1];
    } else if ($('meta[charset]')) {
      charset = $('meta[charset]').attr('charset');
    }
    if (charset) {
      data = iconv.decode(response.data, charset);
      $ = cheerio.load(data);
    }


    const item = $(title).toArray().map((ele) => {
      const a = $(ele);
      let link = a.is('a') ? a.attr('href') : a.find('a').attr('href');
      link = new URL(link, url).href;
      return {
        link: link,
        title: a.text()
      };
    });

    ctx.state.data = {
        title: $('title').eq(0).text().trim(),
        link: url,
        item: item
    };
};
