const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const boardId = ctx.params.boardId;
    const sortType = ctx.query.sortType || 'byCtime';
    const response = await got({
        method: 'get',
        url: `https://www.zfrontier.com/board/${boardId}?sort=${sortType}&page=1`,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const boardTitle = $('.board-head-area h1').text();
    const list = $('.post-entry');
    ctx.state.data = {
        title: `${boardTitle} - 贴子列表 - zFrontier装备前线`,
        link: response.url,
        description: 'zFrontier 发烧友的最前线',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    return {
                        title: item.find('.post-title h2').text(),
                        description: `${item.find('.ellipsis').html()}<br/>${item.find('.imgs-wrap').html()}`,
                        link: `https://www.zfrontier.com${item.find('.post-title').attr('href')}`,
                        author: item.find('.author a').text(),
                        pubDate: new Date(item.find('.time').text()).toLocaleDateString(),
                    };
                })
                .get(),
    };
};
