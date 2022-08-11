const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const dayjs = require('dayjs');
const baseUrl = 'https://seekingalpha.com';

module.exports = async (ctx) => {
    const { category = 'news', symbol } = ctx.params;
    const pageUrl = `${baseUrl}/symbol/${symbol.toUpperCase()}/${category === 'transcripts' ? `earnings/${category}` : category}`;

    const response = await got(`${baseUrl}/api/v3/symbols/${symbol.toUpperCase()}/${category}`, {
        searchParams: {
            cacheBuster: category === 'news' ? dayjs().format('YYYY-MM-DD') : undefined,
            id: symbol.toLowerCase(),
            include: 'author,primaryTickers,secondaryTickers,sentiments',
            'page[size]': ctx.query.limit ? Number(ctx.query.limit) : category === 'news' ? 40 : 20,
        },
    });

    const list = response.data.data?.map((item) => ({
        title: item.attributes.title,
        link: new URL(item.links.self, baseUrl).href,
        pubDate: parseDate(item.attributes.publishOn),
        author: response.data.included.find((i) => i.id === item.relationships.author.data.id).attributes.nick,
    }));

    const items = list
        ? await Promise.all(
              list.map((item) =>
                  ctx.cache.tryGet(item.link, async () => {
                      const response = await got(item.link);
                      const $ = cheerio.load(response.data);

                      const summary = $('[data-test-id=article-summary-title]').length ? $('[data-test-id=article-summary-title]').html() + $('[data-test-id=article-summary-title]').next().html() : '';

                      item.category = $('div[data-test-id=themes-list] a')
                          .toArray()
                          .map((c) => $(c).text());
                      item.description = summary + $('div.paywall-full-content').html();

                      return item;
                  })
              )
          )
        : [];

    ctx.state.data = {
        title: response.data.meta.page.title,
        description: response.data.meta.page.description,
        link: pageUrl,
        image: 'https://seekingalpha.com/samw/static/images/favicon.svg',
        item: items,
        allowEmpty: true,
        language: 'en-US',
    };
};
