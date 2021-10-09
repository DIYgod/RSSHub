const got = require('got');
const Cheerio = require('cheerio');
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
module.exports = async (ctx) => {
    const { cat = '8kasianidol' } = ctx.params;
    const url = `${SUB_URL}category/${cat}/`;
    const resp = await got(url);
    const $ = Cheerio.load(resp.body);
    ctx.state.data = resp.body
        ? {
              title: `${SUB_NAME_PREFIX}-${$('#wrap > div > div > div > div.sec-panel-head > h1 > span').text()}`,
              link: url,
              item: await Promise.all(
                  Cheerio.load(resp.body)('#wrap > div > div > div > ul > li.item')
                      .map((_, e) => {
                          const { href } = Cheerio.load(e)('h2 > a')[0].attribs;
                          return ctx.cache.tryGet(href, () => loadArticle(href));
                      })
                      .toArray()
              ),
          }
        : {
              title: `${SUB_NAME_PREFIX}-${cat}`,
              link: url,
              item: [{ title: '获取失败' }],
          };
};
