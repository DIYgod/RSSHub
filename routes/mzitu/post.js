const axios = require('axios');
const template = require('../../utils/template');
const cheerio = require('cheerio');
const config = require('../../config');

module.exports = async (ctx) => {
  let id = ctx.params.id;

  const url = `http://www.mzitu.com/${id}`;

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

  const img = $('.main-image > p > a > img');
  const imgUrl = img.attr('src');

  const prefix = imgUrl.substr(0, imgUrl.lastIndexOf('01.'));
  const suffix = imgUrl.substr(imgUrl.lastIndexOf('.'));

  let totalPage = $('.pagenavi > a:nth-last-child(2)').find('span').text();
  totalPage = +totalPage;

  const list = [{
    url,
    imgUrl,
    page: 1
  }];
  for (let i = 2; i <= totalPage; i++) {
    const p = i < 10 ? `0${i}` : i;
    const nextImgUrl = `${prefix}${p}${suffix}`;
    const nextUrl = `${url}/${i}`;
    list.push({
      url: nextUrl,
      imgUrl: nextImgUrl,
      page: i
    });
  }

  const title = $('title').text();

  const reg = /[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d/;

  ctx.body = template({
    title: title,
    link: url,
    description: $('meta[name="description"]').attr('content') || title,
    item: list && list.map((item) => {
      let date = new Date();
      const dateStr = $('.main-meta > span:nth-child(2)').text();
      if (reg.test(dateStr)) {
        date = new Date(dateStr.match(reg)[0]);
      }

      return {
        title: `${title}（${item.page}）`,
        description: `分类：${$('.main-meta > span:nth-child(1) > a').text()}<br>描述：${title}（${item.page}）<br><img referrerpolicy="no-referrer" src="${item.imgUrl}">`,
        pubDate: date.toUTCString(),
        link: item.url
      };
    })
  });
};
