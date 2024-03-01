const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const CATEGORY_MAP = {
    domestic: 'domestic',
    international: 'international',
    social: 'social',
    news100: 'news100',
};

module.exports = async (ctx) => {
    const baseUrl = 'https://news.china.com';
    const category = CATEGORY_MAP[ctx.params.category] ?? CATEGORY_MAP.domestic;
    const websiteUrl = `${baseUrl}/${category}`;
    const response = await got(websiteUrl);
    const data = response.data;
    const $ = cheerio.load(data);
    const categoryTitle = $('.wp_title').text();
    const news = $('.item_list li');
    ctx.state.data = {
        title: `中华网-${categoryTitle}新闻`,
        link: websiteUrl,
        item:
            news &&
            news
                .map((_, item) => {
                    item = $(item);
                    return {
                        title: item.find('.item_title a').text(),
                        author: item.find('.item_source').text(),
                        category: `${categoryTitle}新闻`,
                        pubDate: parseDate(item.find('.item_time').text()),
                        description: item.find('.item_title a').text(),
                        link: item.find('li a').attr('href'),
                    };
                })
                .get(),
    };
};
