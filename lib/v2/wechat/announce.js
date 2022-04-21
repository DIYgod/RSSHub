const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { data: htmlString } = await got({
        method: 'get',
        url: 'https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncementlist&lang=zh_CN',
    });

    const $ = cheerio.load(htmlString);
    const announceList = [];

    $('.mp_news_list > .mp_news_item').each(function () {
        const $item = $(this);
        const $link = $item.find('a');
        const time = $item.find('.read_more').text();
        const title = $item.find('strong').text();

        announceList.push({
            title: `${time} ${title}`,
            link: `https://mp.weixin.qq.com${$link.attr('href')}`,
            description: title,
            pubDate: parseDate(time),
        });
    });

    ctx.state.data = {
        title: '微信公众平台-系统公告栏目',
        link: 'https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncementlist&lang=zh_CN',
        item: announceList,
    };
};
