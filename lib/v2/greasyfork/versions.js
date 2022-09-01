const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const script = ctx.params.script;
    const currentUrl = `https://greasyfork.org/scripts/${script}/versions`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: $('.history_versions li')
            .get()
            .map((item) => {
                item = $(item);
                const versionNumberLink = item.find('.version-number a');

                return {
                    title: versionNumberLink.text(),
                    description: item.find('.version-changelog').text().trim(),
                    pubDate: parseDate(item.find('gf-relative-time').attr('datetime')),
                    link: versionNumberLink.attr('href'),
                };
            }),
    };
};
