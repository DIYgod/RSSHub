const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const link = `https://bbs.zhibo8.cc/forum/topic?tid=${id}`;

    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const title = $('div.topic-title > h1').text();
    const list = $('.topic-content .topic-table');

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const author = item.find('.topic-left > div > a').text();
                const floor = item.find('p.topic-foot span:nth-child(2)').text();
                const description = item.find('.detail_ent').html().replace(/src="/g, 'src="https:');

                const single = {
                    title: `${floor}：${author}发表了新回复`,
                    author,
                    description,
                    guid: floor,
                };

                return Promise.resolve(single);
            })
            .get()
    );

    ctx.state.data = {
        title: `“${title}”的新回复—直播吧`,
        link: link,
        item: out,
    };
};
