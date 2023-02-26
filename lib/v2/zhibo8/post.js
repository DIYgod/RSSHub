const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://bbs.zhibo8.cc/forum/topic?tid=${id}`;

    const response = await got(link);
    const $ = cheerio.load(response.data);

    const title = $('div.topic-title > h1').text();
    const list = $('.topic-content .topic-table');

    const out = list.toArray().map((item) => {
        item = $(item);
        const author = item.find('.topic-left > div > a').text();
        const floor = item.find('p.topic-foot span:nth-child(2)').text();
        const description = item.find('.detail_ent').html().replace(/src="/g, 'src="https:');
        const pubDate = timezone(
            parseDate(
                item
                    .find('p.topic-foot')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/)[0],
                'YYYY-MM-DD HH:mm'
            ),
            +8
        );

        const single = {
            title: `${floor}：${author}发表了新回复`,
            author,
            description,
            link,
            pubDate,
            guid: `zhibo8:post:${id}:${floor}`,
        };

        return single;
    });

    ctx.state.data = {
        title: `“${title}”的新回复—直播吧`,
        link,
        item: out,
    };
};
