const { baseURL, puppeteerGet } = require('./utils');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const name = ctx.params.name;
    const query = new URLSearchParams(ctx.params.routeParams);
    const link = `https://alternativeto.net/platform/${name}/?${query.toString()}`;

    // use Puppeteer due to the obstacle by cloudflare challenge
    const html = await puppeteerGet(link, ctx.cache);
    const $ = cheerio.load(html);

    ctx.state.data = {
        title: $('.Heading_h1___Cf5Y').text().trim(),
        description: $('.intro-text').text().trim(),
        link,
        item: $('.AppListItem_appInfo__h9cWP')
            .toArray()
            .map((element) => {
                const item = $(element);
                const title = item.find('.Heading_h2___LwQD').text().trim();
                const link = `${baseURL}${item.find('.Heading_h2___LwQD a').attr('href')}`;
                const description = item.find('.AppListItem_description__wtODK').text().trim();

                return {
                    title,
                    link,
                    description,
                };
            }),
    };
};
