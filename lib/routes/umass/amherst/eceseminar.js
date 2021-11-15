import got from '~/utils/got.js';
import cheerio from 'cheerio';

export default async (ctx) => {
    const {
        data
    } = await got({
        method: 'get',
        url: 'http://ece.umass.edu/seminars',
    });

    const $ = cheerio.load(data);
    const list = $('.view-seminar-events .views-row');

    ctx.state.data = {
        title: 'UMAmherst-ECESeminar',
        link: 'https://ece.umass.edu/seminars',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    const eventDate = item.find('.views-field-field-datetime .date-display-single').first().attr('content');
                    return {
                        title: item.find('.views-field-title').first().text() + ' | ' + item.find('.views-field-field-title2').first().text(),
                        description:
                            '<br/>Presenter: ' +
                            item.find('.views-field-field-presenter').first().text() +
                            '<br/>Date:' +
                            item.find('.views-field-field-datetime').first().text() +
                            '<br/>Location:' +
                            item.find('.views-field-field-location').first().text(),
                        link: item.find('.views-field-title a').attr('href'),
                        pubDate: new Date(Date.parse(eventDate)).toUTCString(),
                    };
                })
                .get(),
    };
};
