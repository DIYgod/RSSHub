const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');
const config = require('@/config').value;

const renderDescription = (description, images) => art(path.join(__dirname, './templates/description.art'), { description, images });

module.exports = async (ctx) => {
    const { keyword, language } = ctx.params;
    const searchParams = new URLSearchParams({
        q: keyword,
    });
    const tempUrl = new URL('https://www.google.com/search');
    tempUrl.search = searchParams.toString();
    const url = tempUrl.toString();
    const key = `google-search:${language}:${url}`;
    const items = await ctx.cache.tryGet(
        key,
        async () => {
            const response = (
                await got(url, {
                    headers: {
                        'Accept-Language': language,
                    },
                })
            ).data;
            const $ = cheerio.load(response);
            const content = $('#rso');
            return content
                .find('> div')
                .map((i, el) => {
                    const element = $(el);
                    const link = element.find('div > div > div > div > div > span > a').first().attr('href');
                    const title = element.find('div > div > div> div > div > span > a > h3').first().text();
                    const imgs = element
                        .find('img')
                        .map((_j, _el) => $(_el).attr('src'))
                        .toArray();
                    const description = element.find('div[style="-webkit-line-clamp:2"]').first().text() || element.find('div[role="heading"]').first().text();
                    const author = element.find('div > div > div > div > div > span > a > div > div > span').first().text() || '';
                    return {
                        link,
                        title,
                        description: renderDescription(description, imgs),
                        author,
                    };
                })
                .toArray()
                .filter((e) => e?.link);
        },
        config.cache.routeExpire,
        false
    );

    ctx.state.data = {
        title: `${keyword} - Google Search`,
        description: `${keyword} - Google Search`,
        link: url,
        item: items,
    };
};
