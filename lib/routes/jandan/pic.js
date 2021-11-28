const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseRelativeDate } = require('@/utils/parse-date');

const baseUrl = 'http://jandan.net/';

module.exports = async (ctx) => {
    const { sub_model } = ctx.params;

    const response = await got({
        method: 'get',
        url: `${baseUrl}${sub_model}/`,
    });

    const $ = cheerio.load(response.data);

    let rssTitle;
    let description;

    switch (sub_model) {
        case 'pic':
            rssTitle = '煎蛋无聊图';
            description = '煎蛋官方无聊图，无限活力的热门图区';
            break;

        case 'ooxx':
            rssTitle = '煎蛋随手拍';
            description = '分享你的经典一刻';
            break;

        case 'zoo':
            rssTitle = '煎蛋动物园';
            description = '专吸各种萌物';
            break;

        case 'girl':
            rssTitle = '煎蛋女装图';
            description = '';
            break;

        case 'top-ooxx':
            rssTitle = '煎蛋随手拍热榜';
            description = '手机相册中的有趣的图片';
            break;

        case 'top-4h':
            rssTitle = '煎蛋4小时热榜';
            description = '煎蛋无聊图4小时热门排行榜';
            break;

        case 'top':
            rssTitle = '煎蛋无聊图热榜';
            description = '煎蛋无聊图热门排行榜';
            break;

        default:
            rssTitle = '未知内容';
            description = '未知内容，请前往 https://github.com/DIYgod/RSSHub/issues 提交 issue';
    }

    ctx.state.data = {
        title: rssTitle,
        link: `${baseUrl}${sub_model}/`,
        description,
        item: $('.commentlist > li[id^="comment"]')
            .map((_, comment) => {
                comment = $(comment);
                const id = comment.find('.righttext > a').text();
                const author = comment.find('.author > strong').text();
                const timeInfo =
                    comment
                        .find('.author small')
                        .text()
                        .replace('minutes', '分钟')
                        .replace('hours', '小时')
                        .replace('days', '天')
                        .replace(/.*?(\d+)\s?(分钟|小时|天|周).*/, '$1$2前') || '';
                return {
                    link: `https://jandan.net/t/${id}`,
                    title: `${author}/${id}`,
                    author,
                    pubDate: parseRelativeDate(timeInfo),
                    guid: id,
                    description: comment.find('.text > p').html().replace('thumb180', 'large').replace('mw1024', 'large'),
                };
            })
            .get(),
    };
};
