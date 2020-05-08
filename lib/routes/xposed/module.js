const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = `https://repo.xposed.info/module/${ctx.params.mod}`;
    const response = await got({
        method: 'get',
        url: link,
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('#page-title').text();
    const list = $('div.field-collection-view');

    ctx.state.data = {
        title: `${title}(${ctx.params.mod}) 更新`,
        link: link,
        item:
            list &&
            list
                .map((_, item) => {
                    item = $(item);
                    const version = item.find('div.field-name-field-version-number div.even').text();
                    return {
                        title: `Version ${version}`,
                        description: item.find('div.field-name-field-changes').html(),
                        link: link,
                        pubDate: item.find('span.date-display-single').html().replace('- ', ''),
                        guid: ctx.params.mod + version,
                    };
                })
                .get(),
    };
};
