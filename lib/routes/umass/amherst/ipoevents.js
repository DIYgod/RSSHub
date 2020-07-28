const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'https://www.umass.edu/ipo/iss/events',
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.view-content .ed-abroad-events');

    ctx.state.data = {
        title: 'UMAmherst-IpoEvents',
        link: 'https://www.umass.edu/ipo/iss/events',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);
                    const eventDateTxt = item.find('.views-field-field-event-date .date-display-single').first();
                    const eventStartDateTxt = item.find('.views-field-field-event-date .date-display-single .date-display-start').first().attr('content');

                    $.fn.ignore = function (sel) {
                        return this.clone()
                            .find(sel || '>*')
                            .remove()
                            .end();
                    };

                    const descTxt = item.find('.views-field-body').first();

                    return {
                        title: item.find('.views-field-title a').first().text(),
                        description: eventDateTxt + '<br/>' + descTxt,
                        link: item.find('.views-field-title a').attr('href'),
                        pubDate: new Date(Date.parse(eventStartDateTxt)).toUTCString(),
                    };
                })
                .get(),
    };
};
