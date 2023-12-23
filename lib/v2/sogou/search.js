const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;

const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://www.sogou.com/web?query=${encodeURIComponent(keyword)}`;
    const key = `sogou-search:${url}`;
    const items = await ctx.cache.tryGet(
        key,
        async () => {
            const response = (await got(url)).data;
            const $ = cheerio.load(response);
            const result = $('#main');
            return result
                .find('.vrwrap')
                .map((i, el) => {
                    const element = $(el);
                    const imgs = element
                        .find('img')
                        .map((j, el2) => $(el2).attr('src'))
                        .toArray();
                    const link = element.find('h3 a').first().attr('href');
                    const title = element.find('h3').first().text();
                    const description = element.find('.text-layout').first().text() || element.find('.space-txt').first().text() || element.find('[class^="translate"]').first().text();
                    const author = element.find('.citeurl span').first().text() || '';
                    const pubDate = parseDate(element.find('.citeurl .cite-date').first().text().trim());
                    return {
                        link,
                        title,
                        description: renderDescription(description, imgs),
                        author,
                        pubDate,
                    };
                })
                .toArray()
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    ctx.state.data = {
        title: `${keyword} - 搜狗搜索`,
        description: `${keyword} - 搜狗搜索`,
        link: url,
        item: items,
    };
};
