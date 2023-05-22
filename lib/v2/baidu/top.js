const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { board = 'realtime' } = ctx.params;
    const link = `https://top.baidu.com/board?tab=${board}`;
    const { data: response } = await got(link);

    const $ = cheerio.load(response);

    const { data } = JSON.parse(
        $('#sanRoot')
            .contents()
            .filter((e) => e.nodeType === 8)
            .prevObject[0].data.match(/s-data:(.*)/)[1]
    );

    const items = data.cards[0].content.map((item) => ({
        title: item.word,
        description: art(path.join(__dirname, 'templates/top.art'), {
            item,
        }),
        link: item.rawUrl,
    }));

    ctx.state.data = {
        title: `${data.curBoardName} - 百度热搜`,
        description: $('meta[name="description"]').attr('content'),
        link,
        item: items,
    };
};
