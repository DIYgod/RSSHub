const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, fixImage, fixVideo } = require('./utils');

module.exports = async (ctx) => {
    const { name } = ctx.params;
    const link = `${baseUrl}/${name}`;
    const response = await got(link, {
        responseType: 'buffer',
    });

    const charset = response.headers['content-type'].match(/charset=([\w-]+)/)[1]; // windows-1251
    const $ = cheerio.load(iconv.decode(response.data, charset));

    const items = $('.story__main')
        .not('.story__placeholder')
        .toArray()
        .map((story) => {
            story = $(story);

            const a = story.find('.story__title a');
            fixImage(story);
            story.find('.player').each((_, elem) => {
                elem = $(elem);
                fixVideo(elem);
            });
            return {
                title: a.text(),
                link: a.attr('href'),
                pubDate: parseDate(story.find('time').attr('datetime')),
                description: story.find('.story__content-inner').html(),
                author: story.find('.user__nick').text(),
            };
        });

    ctx.state.data = {
        title: $('meta[property="og:title"]').attr('content'),
        description: $('.profile__user-about-content').text(),
        image: $('meta[property="og:image"]').attr('content'),
        language: 'ru-RU',
        link,
        item: items,
    };
};
