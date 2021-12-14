const got = require('got');
const Cheerio = require('cheerio');
const { SUB_NAME_PREFIX, SUB_URL } = require('./const');
const loadArticle = require('./article');
const url = SUB_URL;

module.exports = async (ctx) => {
    const response = await got(url);
    ctx.state.data = {
        title: `${SUB_NAME_PREFIX}-最新`,
        link: url,
        item: response.body
            ? await Promise.all(
                  Cheerio.load(response.body)('#wrap > div > div > div > ul > li.item')
                      .map((_, e) => {
                          const { href } = Cheerio.load(e)('div > h2 > a')[0].attribs;
                          return ctx.cache.tryGet(href, () => loadArticle(href));
                      })
                      .toArray()
              )
            : [
                  {
                      title: '获取失败！',
                  },
              ],
    };
};
