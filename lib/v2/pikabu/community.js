const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { baseUrl, fixImage, fixVideo } = require('./utils');

module.exports = async (ctx) => {
    const { type, name, sort = 'new' } = ctx.params;
    const sortString = sort === 'default' || type === 'tag' ? '' : `/${sort}`;
    const { data: response } = await got(`${baseUrl}/ajax/${type}/${name}${sortString}`);

    const items = response.data.stories.map((story) => {
        const $ = cheerio.load(story.html, null, false);
        const data = JSON.parse($('script[type="application/ld+json"]').text());

        const content = $('.story__main');

        fixImage(content);
        content.find('.player').each((_, elem) => {
            elem = $(elem);
            fixVideo(elem);
        });
        return {
            title: data.name,
            description: content.find('.story__content-inner').html(),
            pubDate: parseDate(data.dateCreated),
            author: data.author.name,
            link: data.url,
        };
    });

    ctx.state.data = {
        title: response.data.title,
        link: `${baseUrl}/${type}/${name}`,
        language: 'ru-RU',
        item: items,
    };
};
