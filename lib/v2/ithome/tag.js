const got = require('@/utils/got');
const cheerio = require('cheerio');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

const rootUrl = 'https://www.ithome.com/';

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const url = `${rootUrl}/tag/${name}`;

    const response = await got(url);
    const $ = cheerio.load(response.data);
    const list = $('ul.bl > li')
        .map((_, item) => ({
            title: $(item).find('h2 > a').text(),
            link: $(item).find('h2 > a').attr('href'),
            pubDate: timezone(parseDate($(item).find('div.c').attr('data-ot')), +8),
        }))
        .get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                const article = content('div.post_content');
                article.find('img[data-original]').each((_, ele) => {
                    ele = $(ele);
                    ele.attr('src', ele.attr('data-original'));
                    ele.removeAttr('class');
                    ele.removeAttr('data-original');
                });
                item.description = article.html();
                item.author = content('span.author_baidu > strong').text();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: `IT之家 - ${name}标签`,
        link: url,
        item: items,
    };
};
