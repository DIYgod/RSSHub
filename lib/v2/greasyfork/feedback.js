const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const script = ctx.params.script;
    const rootUrl = 'https://greasyfork.org';
    const currentUrl = `${rootUrl}/scripts/${script}/feedback`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: $('.script-discussion-list .discussion-list-container .discussion-list-item')
            .get()
            .map((item) => {
                item = $(item);
                const metaItem = item.find('.discussion-meta .discussion-meta-item').eq(0);
                const discussionTitle = item.find('.discussion-title');

                return {
                    title: discussionTitle.text().trim(),
                    author: metaItem.find('a').text(),
                    pubDate: parseDate(metaItem.find('gf-relative-time').attr('datetime')),
                    link: rootUrl + discussionTitle.attr('href'),
                };
            }),
    };
};
