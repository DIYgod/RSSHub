const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { data: htmlString } = await got({
        method: 'get',
        url: 'https://developers.weixin.qq.com/community/pay/list/2',
    });
    const $ = cheerio.load(htmlString);
    const announceList = [];
    $('#article_frame > div > ul > li').each(function() {
        const $item = $(this);
        const $link = $item.find('a').attr('href');
        const time = $item.find('div > em').text();
        const title = $item.find('h2 > meta').attr('content');

        announceList.push({
            title: title,
            link: `https://developers.weixin.qq.com${$link}`,
            description: title,
            pubDate: time,
        });
    });

    ctx.state.data = {
        title: '微信开放社区-微信支付公告',
        link: 'https://developers.weixin.qq.com/community/pay/list/2',
        item: announceList,
    };
};
