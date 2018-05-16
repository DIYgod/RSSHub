const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {

  const url = 'http://www.mzitu.com/zhuanti';

  const response = await axios({
    method: 'get',
    url: url,
    headers: {
      'User-Agent': config.ua,
      Referer: url
    }
  });

  const data = response.data;
  const $ = cheerio.load(data);
  const list = $('.main-content > div.postlist > dl > dd');

  ctx.state.data = {
    title: $('title').text(),
    link: url,
    description: $('meta[name="description"]').attr('content') || $('title').text(),
    item: list && list.map((item, index) => {
      item = $(index);
      const linkA = item.find('a');
      const previewImg = linkA.find('img');
      return {
        title: previewImg.attr('alt'),
        description: `${item.find('i').text()}<br>描述：${previewImg.attr('alt')}<br><img referrerpolicy="no-referrer" src="${previewImg.data('original')}">`,
        pubDate: '',
        link: linkA.attr('href')
      };
    }).get(),
  };
};
