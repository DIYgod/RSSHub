const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    // bangumi.tv未提供获取小组话题的API，因此仍需要通过抓取网页来获取
    const topicID = ctx.params.id;
    const link = `https://bgm.tv/group/topic/${topicID}`;
    const { data: html } = await got(link);
    const $ = cheerio.load(html);
    const title = $('#pageHeader h1').text();
    const latestReplies = $('.row_reply')
        .toArray()
        .map((el) => {
            const $el = $(el);
            return {
                id: $el.attr('id'),
                author: $el.find('.userInfo .l').text(),
                content: $el.find('.reply_content .message').html(),
                date: $el.children().first().find('small').children().remove().end().text().slice(3),
            };
        });

    const postTopic = {
        title,
        description: $('.postTopic .topic_content').html(),
        author: $('.postTopic .inner strong a').first().text(),
        pubDate: timezone(parseDate($('.postTopic .re_info small').text().trim().slice(5)), +8),
        link,
    };

    ctx.state.data = {
        title: `${title}的最新回复`,
        link,
        item: [
            ...latestReplies.map((c) => ({
                title: `${c.author} 回复了小组话题《${title}》`,
                description: c.content,
                pubDate: timezone(parseDate(c.date), +8),
                author: c.author,
                link: `${link}#${c.id}`,
            })),
            postTopic,
        ],
    };
};
