const got = require('@/utils/got');
const { parseDate, parseRelativeDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

async function load(link) {
    const res = await got(link);
    const content = cheerio.load(res.data);
    return content;
}

module.exports = async (ctx) => {
    const topic = ctx.params.topic;
    const topicUrl = `https://www.oschina.net/question/topic/${topic}?show=time`;

    const $ = await load(topicUrl);
    const topicName = $('.topic-info > .topic-header > h3').text();
    const list = $('#questionList .question-item')
        .toArray()
        .map((item) => {
            item = $(item);
            const date = item.find('.extra > .list > .item:nth-of-type(2)').text();
            return {
                title: item.find('.header').text(),
                description: item.find('.description').html(),
                link: item.find('.header').attr('href'),
                author: item.find('.extra > .list > .item:nth-of-type(1)').text(),
                pubDate: timezone(/\//.test(date) ? parseDate(date, ['YYYY/MM/DD HH:mm', 'MM/DD HH:mm']) : parseRelativeDate(date), +8),
            };
        });

    const resultItem = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                try {
                    const content = await load(item.link);
                    content('.ad-wrap').remove();
                    item.description = content('#articleContent').html();
                } catch (e) {
                    // 403
                }
                return item;
            })
        )
    );

    ctx.state.data = {
        title: `开源中国-${topicName}`,
        description: $('.topic-introduction').text(),
        link: topicUrl,
        item: resultItem,
    };
};
