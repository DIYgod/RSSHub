const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
  const { a, b } = ctx.params;
  const url = `http://jwc.wmu.edu.cn/${[a, b].filter((i) => i).join('/')}`;

  const response = await got({
    method: 'get',
    url: url
  });
  const $ = cheerio.load(response.data);

  const title = $('.location').text().replace(/\s+/g, ' ').trim().replace('当前位置: 教务首页 > ', '');

  const item = $('.newslist>li,.picnewlist>li').toArray().map((ele) => {
    const a = $(ele);
    return {
      link: a.find('a').attr('href'),
      title: a.find('.tit>div').text(),
      pubDate: new Date(a.find('.time').text()),
      description: a.find('.jj').text()
    };
  });

  ctx.state.data = {
    title: `温州医科大学教务处 - ${title}`,
    link: url,
    item: item
  };
};
