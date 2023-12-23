const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });
const config = require('@/config').value;

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;
    const key = `baidu-search:${url}`;

    const items = await ctx.cache.tryGet(
        key,
        async () => {
            const response = (await got(url)).data;
            const visitedLinks = new Set();
            const $ = cheerio.load(response);
            const contentLeft = $('#content_left');
            const containers = contentLeft.find('.c-container');
            return containers
                .map((i, el) => {
                    const element = $(el);
                    const link = element.find('h3 a').first().attr('href');
                    if (link && !visitedLinks.has(link)) {
                        visitedLinks.add(link);
                        const imgs = element
                            .find('img')
                            .map((_j, _el) => $(_el).attr('src'))
                            .toArray();
                        const description = element.find('.c-gap-top-small [class^="content-right_"]').first().text() || element.find('.c-row').first().text() || element.find('.cos-row').first().text();
                        return {
                            title: element.find('h3').first().text(),
                            description: renderDescription(description, imgs),
                            link: element.find('h3 a').first().attr('href'),
                            author: element.find('.c-row .c-color-gray').first().text() || '',
                        };
                    }
                    return null;
                })
                .toArray()
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    ctx.state.data = {
        title: `${keyword} - 百度搜索`,
        description: `${keyword} - 百度搜索`,
        link: url,
        item: items,
    };
};
