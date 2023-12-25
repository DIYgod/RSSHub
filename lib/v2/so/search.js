const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });

module.exports = async (ctx) => {
    const { keyword } = ctx.params;
    const url = `https://www.so.com/s?q=${encodeURIComponent(keyword)}`;
    const cookieKey = '360-so-search-cookie';
    const cookie = await ctx.cache.tryGet(cookieKey, async () => {
        const response = await got('https://www.so.com/', {
            headers: {
                Origin: 'https://www.so.com/',
                Referer: 'https://www.so.com/',
            },
        });
        const setCookie = response.headers['set-cookie'];
        return setCookie?.map((e) => e.split(';')[0])?.join('; ');
    });
    const key = `360-so-search:${url}`;
    const items = await ctx.cache.tryGet(
        key,
        async () => {
            const response = await got(url, {
                headers: {
                    Origin: 'https://www.so.com/',
                    Referer: url,
                    Cookie: cookie,
                },
            });
            const $ = cheerio.load(response.data);
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
                        title: element.find('h3').first().text().trim(),
                        description: renderDescription(description.trim(), imgs).trim(),
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
