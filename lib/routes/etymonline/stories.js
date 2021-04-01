const got = require('@/utils/got');
const cheerio = require('cheerio');

const host = 'https://www.etymonline.com';

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.etymonline.com/columns?ref=etymonline_homepage',
    });

    const data = response.data;

    const $ = cheerio.load(data);

    const list = $('.ant-col-sm-8');

    const fulltext = await Promise.all(
        list
            .slice(0, 10)
            .map(async (_, item) => {
                item = $(item);
                const fulltextlink = host + item.find('.ant-col-sm-8 a').attr('href');

                const cache = await ctx.cache.get(fulltextlink);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await got.get(fulltextlink);
                const $$ = cheerio.load(response.data);

                const upload_data = $$('.post__date--1iMCz').text();
                const preview_text = $$('.ant-col-xs-24').html().trim().replace(/src="/g, `src="${host}`);

                const preview_version = {
                    title: item.find('h3.card__title--1ls9E p').text(),
                    description: preview_text,
                    link: fulltextlink,
                    pubDate: upload_data,
                };
                ctx.cache.set(fulltextlink, JSON.stringify(preview_version));

                return Promise.resolve(preview_version);
            })
            .get()
    );

    ctx.state.data = {
        title: 'Etymonline Latest Stories',
        link: 'https://www.etymonline.com/columns?ref=etymonline_homepage',
        item: fulltext,
    };
};
