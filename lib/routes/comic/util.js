const url = require('url');
const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

exports.getPage = async (ctx, info) => {
  const response = await got({
    method: 'get',
    url: info.url,
    responseType: 'buffer'
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

  const bookTitle = $(info.title).eq(0).text();
  const bookIntro = $(info.intro).eq(0).text();
  const chapters = $(info.chapter).toArray().map((ele) => {
    const a = $(ele);
    return {
      link: url.resolve(info.url, a.attr('href')),
      title: a.text(),
      num: a.text()
    };
  });
  const items = chapters.map((chapter) => ({
    link: chapter.link,
    title: chapter.title,
    description: `<h1>${chapter.num}</h1><h2>${bookTitle}</h2>`
  }));

  return {
    title: `${info.site} - ${bookTitle}`,
    link: info.url,
    description: bookIntro,
    item: items
  };
};

exports.createHandler = (info) => async (ctx) => {
  ctx.state.data = await exports.getPage(ctx, info);
};
