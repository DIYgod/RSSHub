const got = require('@/utils/got');
const cheerio = require('cheerio');
const path = require('path');
const { art } = require('@/utils/render');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const renderDescription = (desc) => art(path.join(__dirname, 'templates/description.art'), desc);

module.exports = async (ctx) => {
    const rootUrl = 'https://warthunder.com/en/news/';

    const response = await got(rootUrl);

    const $ = cheerio.load(response.data);

    const pageFace = $('div.showcase__item.widget')
        .map((_, item) => {
            item = $(item);
            let pubDate = parseDate(item.find('div.widget__content > ul > li').text(), 'D MMMM YYYY');
            pubDate = timezone(pubDate, 0);
            const category = [];
            if (item.find('div.widget__pin').length !== 0) {
                category.push('pinned');
            }
            if (item.find('a.widget__decal').length !== 0) {
                category.push('decal');
            }
            if (item.find('div.widget__badge').length !== 0) {
                category.push(item.find('div.widget__badge').text());
            }
            return {
                link: `https://warthunder.com${item.find('a.widget__link').attr('href')}`,
                title: item.find('div.widget__content > div.widget__title').text(),
                pubDate,
                description: renderDescription({
                    description: item.find('div.widget__content > div.widget__comment').text(),
                    imglink: item.find('div.widget__poster > img.widget__poster-media').attr('data-src'),
                }),
                category,
            };
        })
        .get();

    ctx.state.data = {
        title: 'War Thunder News',
        link: 'https://warthunder.com/en/news/',
        item: pageFace,
    };
};
