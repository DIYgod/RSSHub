const axios = require('../../../utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    // bangumi.tv未提供获取小组话题的API，因此仍需要通过抓取网页来获取
    const topicID = ctx.params.id;
    const link = `https://bgm.tv/group/topic/${topicID}`;
    const html = (await axios.get(link)).data;
    const $ = cheerio.load(html);
    const title = $('#pageHeader h1').text();
    const latestReplies = $('.row_reply')
        .slice(-10)
        .map((i, el) => {
            const $el = $(el);
            return {
                id: $el.attr('id'),
                author: $el.find('.userInfo .l').text(),
                content: $el.find('.reply_content .message').html(),
                date: $el
                    .children()
                    .first()
                    .find('small')
                    .children()
                    .remove()
                    .end()
                    .text()
                    .slice(3),
            };
        })
        .get()
        .reverse();

    ctx.state.data = {
        title: `${title}的最新回复`,
        link,
        item: latestReplies.map((c) => ({
            title: `${c.author}回复了小组话题《${title}》`,
            description: c.content,
            guid: c.id,
            pubDate: new Date(c.date).toUTCString(),
            link,
        })),
    };
};
