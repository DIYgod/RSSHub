const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;

    const response = await got(url);
    const visitedLinks = new Set();
    const $ = cheerio.load(response.data);
    const content_left = $('#content_left');
    const containers = content_left.find('.c-container');
    const items = containers
        .map((i, el) => {
            const element = $(el);
            const link = element.find('h3 a').first().attr('href');
            if (link && !visitedLinks.has(link)) {
                visitedLinks.add(link);
                return {
                    title: element.find('h3').first().text(),
                    description: element.find('.c-gap-top-small [class^="content-right_"]').first().text() || element.find('.c-row').first().text() || element.find('.cos-row').first().text(),
                    link: element.find('h3 a').first().attr('href'),
                    author: element.find('.c-row .c-color-gray').first().text() || '',
                };
            }
            return null;
        })
        .toArray()
        .filter((e) => e && e.link);
    ctx.state.data = {
        title: `${keyword} - 百度搜索`,
        description: `${keyword} - 百度搜索`,
        link: url,
        item: items,
    };
};
