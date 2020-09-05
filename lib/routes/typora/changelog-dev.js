const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    ctx.params.os = ctx.params.os || 'macos';

    const currentUrl = `https://typora.io${ctx.params.os.toLowerCase() === 'macos' ? '' : '/windows'}/dev_release.html`;
    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data.replace(/<h4>/g, '</div><div><h4>'));

    const items = $('div')
        .slice(0, 10)
        .map((_, item) => {
            item = $(item);
            const h4 = item.find('h4');
            h4.remove();
            return {
                title: h4.text(),
                link: currentUrl,
                description: item.html(),
            };
        })
        .get();

    ctx.state.data = {
        title: `Typora Changelog - ${ctx.params.os.toLowerCase() === 'macos' ? 'macOS' : 'Windows/Linux'}`,
        link: currentUrl,
        description: 'Typora Changelog',
        item: items,
    };
};
