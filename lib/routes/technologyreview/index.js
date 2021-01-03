const cheerio = require('cheerio');
const got = require('@/utils/got');

module.exports = async (ctx) => {
    const response = await got.get('https://wp.technologyreview.com/wp-json/irving/v1/data/the_feed?page=1');

    const result = await Promise.all(
        response.data
            .filter((item) => item.config.permalink)
            .map(
                async (item) =>
                    await ctx.cache.tryGet(item.config.permalink, async () => {
                        const article = await got.get(item.config.permalink);
                        const $ = cheerio.load(article.data);

                        // remove annoyances
                        $('.sliderAd__wrapper--1vLJw').remove();
                        $('.newsletter__wrap').remove();
                        $('.related__wrap').remove();
                        $('aside').remove();
                        $('svg.monogramTLogo').remove();
                        $('.image__placeholder--1CF-F').remove();

                        const description = ($('.contentHeader__image--1pFzw').html() || $('.contentHeader--fullBleed__image--2jdH0').html() || '') + ($('.contentHeader__deck--3A9FE').html() || '') + $('#content--body').html();
                        const author = $('.byline__name--2MpUW').clone().children().remove().end().text();

                        return {
                            title: item.config.title || item.config.name || '',
                            author,
                            description,
                            link: item.config.permalink,
                            pubDate: new Date($('.contentHeader__publishDate--37zcW').text()).toISOString(),
                        };
                    })
            )
    );

    ctx.state.data = {
        title: 'MIT Technology Review',
        link: 'https://www.technologyreview.com/',
        item: result,
    };
};
