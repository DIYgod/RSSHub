const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const mid = ctx.params.mid;
    const homePageInfoUrl = `https://i.news.qq.com/i/getUserHomepageInfo?chlid=${mid}`;
    const userInfo = await ctx.cache.tryGet(homePageInfoUrl, async () => (await got(homePageInfoUrl)).data.userinfo);
    const title = userInfo.nick;
    const description = userInfo.user_desc;
    const suid = encodeURIComponent(userInfo.suid);

    const newsListUrl = `https://i.news.qq.com/getSubNewsMixedList?guestSuid=${suid}&tabId=om_index`;
    const news = await ctx.cache.tryGet(newsListUrl, async () => (await got(newsListUrl)).data.newslist, config.cache.routeExpire, false);

    const items = await Promise.all(
        news.map((item) => {
            const title = item.title;
            const pubDate = parseDate(item.timestamp, 'X');
            const itemUrl = item.url;
            const author = item.source;
            const abstract = item.abstract;

            return item.articletype === '4'
                ? {
                      title,
                      description: abstract,
                      link: itemUrl,
                      author,
                      pubDate,
                  }
                : ctx.cache.tryGet(itemUrl, async () => {
                      const response = await got(itemUrl);
                      const $ = cheerio.load(response.data);
                      const data = JSON.parse(
                          $('script:contains("window.DATA")')
                              .text()
                              .match(/window\.DATA = ({.+});/)[1]
                      );
                      const $data = cheerio.load(data.originContent.text, null, false);

                      $data('*')
                          .contents()
                          .filter((_, elem) => elem.type === 'comment')
                          .replaceWith((_, elem) =>
                              art(path.join(__dirname, '../templates/news/image.art'), {
                                  attribute: elem.data.trim(),
                                  originAttribute: data.originAttribute,
                              })
                          );

                      return {
                          title,
                          description: $data.html() || abstract,
                          link: itemUrl,
                          author,
                          pubDate,
                      };
                  });
        })
    );

    ctx.state.data = {
        title,
        description,
        link: `https://new.qq.com/omn/author/${mid}`,
        item: items,
    };
};
