const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let { type } = ctx.params;
    let title = '微信开放社区 - ';
    if (type.startsWith('pay')) {
        type = 'pay';
        title += '微信支付公告';
    } else if (type.startsWith('xcx')) {
        type = 'develop';
        title += '小程序公告';
    } else if (type.startsWith('xyx')) {
        type = 'minigame';
        title += '小游戏公告';
    }
    const link = `https://developers.weixin.qq.com/community/${type}/list/2`;
    const { data: htmlString } = await got({
        method: 'get',
        url: link,
    });
    const $ = cheerio.load(htmlString);
    const announceList = [];
    $('#article_frame > div > ul > li').each(function () {
        const $item = $(this);
        const $link = $item.find('a').attr('href');
        const time = $item.find('div > em').text();
        const title = $item.find('h2 > meta').attr('content');

        announceList.push({
            title,
            link: `https://developers.weixin.qq.com${$link}`,
            description: title,
            pubDate: time,
        });
    });

    ctx.state.data = {
        title,
        link,
        item: announceList,
    };
};
