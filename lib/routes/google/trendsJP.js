const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
  const url = 'https://trends.google.co.jp/trends/trendingsearches/daily/rss?geo=JP';
  const response = await got.get(url);
  const data = response.data;

  const $ = cheerio.load(data, { xmlMode: true });
  const items = $('item').toArray().map((item) => {
    item = $(item);
    return {
      title: item.find('title').text(),
      link: item.find('link').text(),
      pubDate: new Date(item.find('pubDate').text()).toUTCString(),
      description: item.find('description').text(),
    };
  });

  ctx.state.data = {
    title: $('channel > title').text(),
    link: url,
    item: items,
  };
};
