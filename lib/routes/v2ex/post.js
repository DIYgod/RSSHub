const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const postid = ctx.params.postid;
    const pageUrl = `https://www.v2ex.com/t/${postid}`;

    const response = await got({
        method: 'get',
        url: pageUrl,
    });

    const $ = cheerio.load(response.data);
    const list = $('[id^="r_"]').get();

    ctx.state.data = {
        title: `V2EX-${$('.header h1').text()}`,
        link: pageUrl,
        description: $('.topic_content').text(),
        item: list
            .map((item) => {
                const post = $(item);
                const reply_content = post.find('.reply_content').first();
                const no = post.find('.no').first();

                return {
                    title: `#${no.text()} ${reply_content.text()}`,
                    description: reply_content.html(),
                    guid: post.attr('id'),
                    link: `${pageUrl}#${post.attr('id')}`,
                    author: post.find('.dark').first().text(),
                    pubDate: parseDate(post.find('.ago').attr('title')),
                };
            })
            .reverse(),
        allowEmpty: true,
    };
};
