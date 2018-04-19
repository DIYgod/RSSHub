const axios = require('axios');
const art = require('art-template');
const path = require('path');
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

  ctx.body = art(path.resolve(__dirname, '../../views/rss.art'), {
    title: title,
    link: url,
    description: $('meta[name="description"]').attr('content') || title,
    lastBuildDate: new Date().toUTCString(),
    item: list && list.map((item) => {
      return {
        title: `${title}（${item.page}）`,
        description: `分类：${$('.main-meta > span:nth-child(1) > a').text()}<br>描述：${title}（${item.page}）<br><img referrerpolicy="no-referrer" src="${item.imgUrl}">`,
        pubDate: new Date($('.main-meta > span:nth-child(2)').text().replace('发布于 ', '')).toUTCString(),
        link: item.url
      };
    })
  });
};
