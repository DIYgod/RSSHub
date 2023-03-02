const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const link = 'https://www.guggenheim.org/exhibitions';

    const response = await got({
        url: link,
        method: 'GET',
    });

    const code = cheerio.load(response.data)('#app-js-extra').html();
    const data = JSON.parse(code.match(/var bootstrap = ([^\n]*);/)[1]);
    const exhibitions = data.initial.main.posts.featuredExhibitions;
    const items = [].concat(exhibitions.past.items ?? [], exhibitions.on_view.items ?? [], exhibitions.upcoming.items ?? []);

    ctx.state.data = {
        link,
        url: link,
        title: 'The Guggenheim Museums and Foundation - Exhibitions',
        item: items.map((ex) => ({
            title: ex.title,
            link: `https://www.guggenheim.org/exhibition/${ex.slug}`,
            description: ex.excerpt,
            pubDate: ex.dates ? parseDate(`${ex.dates.start.month} ${ex.dates.start.day}, ${ex.dates.start.year}`, 'MMMM D, YYYY') : null,
        })),
    };
};
