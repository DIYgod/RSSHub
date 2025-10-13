const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const { join } = require('path');

module.exports = async (ctx) => {
    const tag = ctx.params.tag;
    const path = tag ? `news/tag/${tag}` : 'news/index';
    const link = new URL(path, utils.host).href;
    const response = await got(link);
    const data = response.data;
    const $ = cheerio.load(data);

    const newsitem = $('.newsitem')
        .toArray()
        .map((element) => {
            element = $(element);
            const a = element.find('h3 a');
            const span = element.find('.space-right-m30');
            const author = span.text().replace('来源：', '').trim();

            return {
                title: a.text(),
                link: new URL(a.attr('href'), utils.host).href,
                description: art(join(__dirname, 'templates/description.art'), {
                    image: element.find('img').attr('src').split('?')[0],
                    text: element.find('.thsis-div a').text().trim(),
                }),
                author,
                pubDate: span.next().length ? timezone(parseDate(span.next().text().trim()), 8) : undefined,
            };
        });

    const item = await Promise.all(
        newsitem.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (item.link.includes('outLinkByIdAndCode')) {
                    return item;
                }

                const response = await got(item.link);
                const $ = cheerio.load(response.data);

                const description = $('.newscontent');
                description.find('.detitemtit, .detposttiau').remove();

                item.description = description.html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('title').text(),
        link: response.url,
        description: $('meta[name="description"]').attr('content'),
        item,
    };
};
