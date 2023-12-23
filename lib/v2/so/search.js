const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://www.so.com/s?q=${encodeURIComponent(keyword)}`;
    const key = `360-so-search:${url}`;
    const items = await ctx.cache.tryGet(
        key,
        async () => {
            const response = (await got(url)).data;
            const $ = cheerio.load(response);
            const result = $('#container .result');
            const resList = result.find('.res-list');
            return resList
                .map((i, el) => {
                    const element = $(el);
                    const imgs = element
                        .find('img')
                        .map((j, el2) => $(el2).attr('src'))
                        .toArray();
                    const description = element.find('.res-desc').first().text() || element.find('.mh-content-desc-info').first().text() || element.find('.res-comm-con').first().text();
                    return {
                        link: element.find('h3 a').first().attr('href'),
                        title: element.find('h3').first().text(),
                        description: renderDescription(description, imgs),
                        author: element.find('.g-linkinfo cite').first().text() || '',
                    };
                })
                .toArray()
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    ctx.state.data = {
        title: `${keyword} - 360 搜索`,
        description: `${keyword} - 360 搜索`,
        link: url,
        item: items,
    };
};
