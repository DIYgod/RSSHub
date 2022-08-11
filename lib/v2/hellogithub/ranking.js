const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let type;
    switch (ctx.params.type) {
        case 'db':
            type = 'db-engines';
            break;
        case 'webserver':
            type = 'netcraft';
            break;
        default:
            type = 'tiobe';
            break;
    }
    const rootUrl = 'https://hellogithub.com/report/' + type;
    ctx.state.data = {
        title: 'HelloGitHub - ranking',
        link: rootUrl,
        item: await ctx.cache.tryGet(rootUrl, async () => {
            const response = await got({
                method: 'get',
                url: rootUrl,
            });
            const $ = cheerio.load(response.data);
            const content = $('.content');
            const title = $('.header').find('h1');

            return [
                {
                    title: title.text(),
                    link: rootUrl,
                    description: content.html(),
                },
            ];
        }),
    };
};
