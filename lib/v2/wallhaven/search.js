const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://wallhaven.cc';

module.exports = async (ctx) => {
    const params = ctx.params.params;
    const url = `${rootUrl}/search?${params}`;

    const response = await got.get(url);
    const $ = cheerio.load(response.data);
    const items = $('li > figure.thumb')
        .map((_, item) => ({
            title: $(item).find('img.lazyload').attr('data-src').split('/').pop(),
            description: $(item)
                .html()
                .match(/<img.*?>/)[0],
            link: $(item).find('a.preview').attr('href'),
        }))
        .get();

    ctx.state.data = {
        title: `Wallhaven - search`,
        link: url,
        item: items,
    };
};
