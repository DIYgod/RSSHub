const url = require('url');
const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

async function load(link) {
    const res = await got({
        method: 'get',
        url: link,
    });
    const content = cheerio.load(res.data);
    content('.ad-wrap').remove();
    return content;
}

module.exports = async (ctx) => {
    const topic = ctx.params.topic;
    const topicUrl = `https://www.oschina.net/question/topic/${topic}?show=time`;

    const $ = await load(topicUrl);
    const topicName = $('.topic-info > .topic-header > h3').text();
    const list = $('#questionList').find('.question-item');
    const count = [];
    for (let i = 0; i < Math.min(list.length, 10); i++) {
        count.push(i);
    }

    const resultItem = await Promise.all(
        count.map(async (i) => {
            const each = $(list[i]);
            const originalUrl = each.find('.header').attr('href');

            const item = {
                title: each.find('.header').text(),
                link: url.resolve('https://www.oschina.net', encodeURI(originalUrl)),
                author: date(each.find('.extra > .list > .item:nth-of-type(1)').text()),
                pubDate: date(each.find('.extra > .list > .item:nth-of-type(2)').text()),
            };

            item.description = await ctx.cache.tryGet(originalUrl, async () => {
                const content = await load(item.link);
                return content('#articleContent').html();
            });

            return item;
        })
    );

    ctx.state.data = {
        title: `开源中国-${topicName}`,
        link: topicUrl,
        item: resultItem,
    };
};
