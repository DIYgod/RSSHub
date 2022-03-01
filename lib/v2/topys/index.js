const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const keyword = ctx.params.keyword ?? '';

    const rootUrl = 'https://www.topys.cn';
    const currentUrl = `${rootUrl}${keyword ? `/search/${keyword}` : '/api/web/article/get_article_list'}`;

    const response = keyword
        ? await got({
              method: 'get',
              url: currentUrl,
          })
        : await got({
              method: 'post',
              url: currentUrl,
              json: {
                  istop_time: 0,
                  size: ctx.query.limit ? parseInt(ctx.query.limit) : 16,
              },
          });

    let items = keyword
        ? response.data.match(/id:(\d+),title:"(.*?)",keyword:"(.*?)",istop_time:(\d+),thumb/g).map((item) => {
              const matches = item.match(/id:(\d+),title:"(.*)",keyword:"(.*)",istop_time:(\d+),thumb/);
              return {
                  title: matches[2],
                  category: matches[3].split(','),
                  link: `${rootUrl}/article/${matches[1]}`,
                  pubDate: parseDate(matches[4] * 1000),
              };
          })
        : response.data.data.map((item) => ({
              title: item.title,
              author: item.editor,
              category: item.keyword.split(','),
              link: `${rootUrl}/article/${item.id}`,
              pubDate: parseDate(item.istop_time * 1000),
          }));

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                item.description = content('.article-content').html();
                item.author = item.author ?? content('.author-name p').first().text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `${keyword ? `${keyword} - ` : ''}TOPYS`,
        link: keyword ? currentUrl : `${rootUrl}/pick`,
        item: items,
    };
};
