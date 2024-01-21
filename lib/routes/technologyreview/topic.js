const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.category_name = ctx.params.category_name || 'humans-and-technology';

    const response = await got.get(`https://wp.technologyreview.com/wp-json/irving/v1/data/term_archive?page=1&category_name=${ctx.params.category_name}`);

    const item = await Promise.all(
        response.data.map((item) =>
            ctx.cache.tryGet(item.config.permalink, async () => {
                try {
                    const res = await got.get(item.config.permalink);
                    const $ = cheerio.load(res.data);
                    const description = $('.contentHeader__image--1pFzw').html() + $('.contentHeader__deck--3A9FE').html() + $('.contentHeader__meta--3u-EJ').html() + $('#content--body').html();
                    return {
                        title: item.config.title,
                        link: item.config.permalink,
                        pubDate: new Date($('.contentHeader__publishDate--37zcW').text()),
                        description,
                    };
                } catch {
                    return '';
                }
            })
        )
    );

    ctx.state.data = {
        title: 'Technology Review',
        link: 'https://www.technologyreview.com/',
        language: 'en-us',
        item,
    };
};
