const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const languages = {
    arabic: {
        rootUrl: 'https://www.aljazeera.net',
        rssUrl: 'rss',
    },
    chinese: {
        rootUrl: 'https://chinese.aljazeera.net',
        rssUrl: undefined,
    },
    english: {
        rootUrl: 'https://www.aljazeera.com',
        rssUrl: 'xml/rss/all.xml',
    },
};

module.exports = async (ctx) => {
    const params = ctx.path === '/' ? ['arabic'] : ctx.path.replace(/^\//, '').split('/');

    if (!languages.hasOwnProperty(params[0])) {
        params.unshift('arabic');
    }

    const language = params.shift();
    const isRSS = params.length === 1 && params.at(-1) === 'rss' && languages[language].rssUrl;

    const rootUrl = languages[language].rootUrl;
    const currentUrl = `${rootUrl}/${isRSS ? languages[language].rssUrl : params.join('/')}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items = isRSS
        ? response.data.match(new RegExp('<link>' + rootUrl + '/(.*?)</link>', 'g')).map((item) => ({
              link: item.match(/<link>(.*?)<\/link>/)[1],
          }))
        : $('.u-clickable-card__link')
              .toArray()
              .map((item) => {
                  item = $(item);

                  return {
                      link: `${rootUrl}${item.attr('href')}`,
                  };
              });

    items = await Promise.all(
        items.slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 50).map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });

                const content = cheerio.load(detailResponse.data);

                content('.more-on').parent().remove();
                content('.responsive-image img').removeAttr('srcset');

                item.title = content('h1').first().text();
                item.author = content('.author').text();
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished": "(.*?)",/)[1]);
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    image: content('.article-featured-image').html(),
                    description: content('.wysiwyg').html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').first().text(),
        link: currentUrl,
        item: items,
    };
};
