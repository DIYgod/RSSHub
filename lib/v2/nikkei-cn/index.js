const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');
const { isValidHost } = require('@/utils/valid-host');

const cleanContent = (language, content) => {
    switch (language) {
        case 'cn': {
            return content.replace(/<strong>版权声明：日本经济新闻社版权所有，未经授权不得转载或部分复制，违者必究。<\/strong>/g, '');
        }
        case 'zh': {
            return content.replace(/<strong>版權聲明：日本經濟新聞社版權所有，未經授權不得轉載或部分複製，違者必究。<\/strong>/g, '');
        }
    }
};

const getPubDate = (link) => {
    const matches = link.match(/(\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}|\d{8})/);
    return matches ? timezone(parseDate(matches[1], 'YYYY-MM-DD-HH-mm-ss'), +9) : undefined;
};

module.exports = async (ctx) => {
    const language = ctx.params.language ?? 'cn';
    const category = ctx.params.category ?? '';
    const type = ctx.params.type ?? '';
    if (!isValidHost(language)) {
        throw Error('Invalid language');
    }

    const rootUrl = `https://${language === 'zh' ? `zh.cn` : language}.nikkei.com`;
    const currentUrl = `${rootUrl}/${category ? (category === 'rss' ? 'rss.html' : `${category}${type ? `/${type}` : ''}.html`) : ''}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    let items =
        category === 'rss'
            ? response.data.match(/<link>(http:\/\/.*\.html)<\/link>/g).map((l) => ({
                  link: l.replace(/<(\/)?link>/g, '').replace(/http:/g, 'https:'),
                  pubDate: getPubDate(l),
              }))
            : $('dt a, p.newsDetailTtl a, ul.listStyle01 li a, table.sliderContent3 td a')
                  .toArray()
                  .map((item) => {
                      item = $(item);

                      const link = item.attr('href');

                      return {
                          link: `${link.startsWith('http') ? '' : rootUrl}${link}`,
                          pubDate: getPubDate(link),
                      };
                  })
                  .sort((a, b) => b.pubDate - a.pubDate) // desc
                  .reduce((prev, cur) => (prev.length && prev[prev.length - 1].link === cur.link ? prev : [...prev, cur]), []) // deduplicate
                  .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 25);

    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: `${item.link}?tmpl=component&print=1`,
                });

                const content = cheerio.load(detailResponse.data);

                content('#contentDiv div').first().remove();

                item.author = content('meta[name="author"]').attr('content');
                item.title = content('meta[name="twitter:title"]').attr('content');
                item.description = cleanContent(language, content('#contentDiv').html());

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
