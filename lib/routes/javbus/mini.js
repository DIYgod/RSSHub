const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
  const { a, b, c } = ctx.params;
  const url = 'https://www.javbus.com/' + [a, b, c].filter((i) => i).join('/');

  const { data } = await got.get(url);
  const $ = cheerio.load(data);

  const title = $('title').eq(0).text().split(' - ').filter((i) => !['JavBus', '影片'].includes(i)).reverse().join(' - ');
  const item = $('.movie-box').toArray().map((i) => {
    let title = $(i).find('.photo-frame>img').eq(0).attr('title');
    const category = $(i).find('.item-tag>button').toArray().map((i) => $(i).text());
    const pubDate = $(i).find('date+date').eq(0).text();
    const guid = $(i).find('date').eq(0).text();
    const link = $(i).attr('href');
    title = `[${guid}] ${title}`;

    return { title, category, pubDate, guid, link };
  });

  ctx.state.data = {
    title: `JavBus - ${title}`,
    link: url,
    item: item,
  };
};
