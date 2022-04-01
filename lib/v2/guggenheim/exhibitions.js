const got = require('@/utils/got');
const cheerio = require('cheerio');
const vm = require('vm');

module.exports = async (ctx) => {
    const link = `https://www.guggenheim.org/exhibitions`;

    const response = await got({
        url: link,
        method: 'GET',
    });

    const code = cheerio.load(response.data)('#app-js-extra').html();
    const context = vm.createContext();
    vm.runInContext(code, context);
    const data = context.bootstrap;
    const exhibitions = data.initial.main.posts.featuredExhibitions;
    const items = [].concat(exhibitions.past.items ? exhibitions.past.items : [], exhibitions.on_view.items ? exhibitions.on_view.items : [], exhibitions.upcoming.items ? exhibitions.upcoming.items : []);

    ctx.state.data = {
        link,
        url: link,
        title: `The Guggenheim Museums and Foundation - Exhibitions`,
        item: items.map((ex) => ({
            title: ex.title,
            link: `https://www.guggenheim.org/exhibition/${ex.slug}`,
            description: ex.excerpt,
        })),
    };
};
