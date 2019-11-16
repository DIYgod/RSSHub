const got = require('@/utils/got');
const cheerio = require('cheerio');

const baseUrl = 'https://www.simonsfoundation.org/news/what-were-reading';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: baseUrl,
    });

    const $ = cheerio.load(response.data);
    ctx.state.data = {
        title: `Simons Foundation | What We're Reading`,
        link: baseUrl,
        description: `Simons Foundation - What We're Reading`,
        item: $('.o-dated-list__row')
            .map((index, item) => ({
                title: $(item)
                    .find('.m-post__title')
                    .text(),
                description: $(item)
                    .find('.m-post__aside')
                    .html(),
                pubDate: new Date(
                    $(item)
                        .find('.o-dated-list__day')
                        .text() +
                        ' ' +
                        $(item)
                            .find('.o-dated-list__month')
                            .text() +
                        ' ' +
                        $(item)
                            .find('.o-dated-list__year')
                            .text()
                ).toUTCString(),

                link: $(item)
                    .find('.m-post__block-link')
                    .attr('href'),
            }))
            .get(),
    };
};
