const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const renderVideo = (link) => art(path.join(__dirname, './templates/video.art'), { link });
    const renderImage = (href) => art(path.join(__dirname, './templates/image.art'), { href });

    const rootUrl = 'https://fisher.spb.ru/news/';
    const response = await got({
        method: 'get',
        url: rootUrl,
        responseType: 'buffer',
    });

    const $ = cheerio.load(iconv.decode(response.data, 'windows-1251'));

    const descBuilder = (element) => {
        const content = cheerio.load(`<p>${$('.news-message-text', element).html()}</p>`).root();
        $('.news-message-media a', element).each((_, elem) => {
            if ($(elem).hasClass('news-message-youtube')) {
                content.append(renderVideo($(elem).attr('data-youtube')));
            } else {
                content.append(renderImage($(elem).attr('href')));
            }
        });
        return content;
    };

    const items = $('.news-message')
        .map((_, elem) => ({
            pubDate: parseDate($('.news-message-date', elem).text().trim(), 'DD.MM.YYYY HH:mm'),
            title: $('.news-message-location', elem).text().trim(),
            description: descBuilder(elem).html(),
            author: $('.news-message-user', elem).text().trim(),
            guid: $(elem).attr('id'),
            link: rootUrl + $('.news-message-comments-number > a', elem).attr('href'),
        }))
        .get();

    ctx.state.data = {
        title: $('head > title').text().trim(),
        link: rootUrl,
        item: items,
    };
};
