const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id ?? '';

    const rootUrl = 'http://www.barronschina.com.cn';
    const currentUrl = `${rootUrl}/index/${id ? `column/article?columnId=${id}` : 'shortNews'}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    const items = id
        ? await Promise.all(
              $('.title')
                  .toArray()
                  .map((item) => {
                      item = $(item);
                      return {
                          title: item.find('.title').text(),
                          link: `${rootUrl}${item.parent().attr('href')}`,
                      };
                  })
                  .map((item) =>
                      ctx.cache.tryGet(item.link, async () => {
                          const detailResponse = await got({
                              method: 'get',
                              url: item.link,
                          });

                          const content = cheerio.load(detailResponse.data);

                          item.description = content('.cont_main').html();
                          item.pubDate = timezone(parseDate(content('.timeTag').text()), +8);

                          return item;
                      })
                  )
          )
        : $('dd')
              .toArray()
              .map((item) => {
                  item = $(item);

                  const title = item.find('strong').text();
                  item.find('strong').remove();

                  const description = item.find('.short').html();
                  item.find('.short').remove();

                  return {
                      title,
                      description,
                      link: currentUrl,
                      pubDate: timezone(parseDate(`${item.parent().find('dt').text()} ${item.text()}`), +8),
                  };
              });

    ctx.state.data = {
        title: $('title').text().split('，')[0],
        link: currentUrl,
        item: items,
    };
};
