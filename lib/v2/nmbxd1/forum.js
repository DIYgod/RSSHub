const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://www.nmbxd1.com';
    const currentUrl = /^\d+$/.test(id) ? `${rootUrl}/Forum/timeline/id/${id}` : `${rootUrl}/f/${id}`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);
    $('.h-threads-img-tool').remove();
    $('.h-threads-item-reply-icon').remove();
    $('.h-admin-tool').remove();
    $('.h-threads-tips').remove();
    $('.h-threads-info-report-btn').remove();
    $('.h-threads-info-reply-btn').remove();

    const items = $('.h-threads-item')
        .get()
        .map((item) => {
            item = $(item);
            // Do not remove the info element to keep the description style consistent.
            const info = item.find('.h-threads-item-main .h-threads-info');
            const title = info.find('.h-threads-info-title').text();
            const author = [info.find('.h-threads-info-uid font'), info.find('.h-threads-info-uid')]
                .find((elem) => elem.length > 0)
                .contents()
                .first()
                .text()
                .replace(/^ID:/, '');
            const category = info.find('spam').text();
            const link = new URL(rootUrl + info.find('.h-threads-info-id').attr('href'));
            // cleanup query paramter
            link.query = link.search = '';
            const pubDate = timezone(parseDate(info.find('.h-threads-info-createdat').text().replace(/\(.\)/, ' ')), +8);

            return {
                title,
                author,
                category,
                description: art(path.join(__dirname, 'templates/description.art'), {
                    item: item.html(),
                }),
                pubDate,
                link: link.toString(),
            };
        });

    ctx.state.data = {
        title: $('title').text(),
        link: currentUrl,
        description: $('meta[name=description]').attr('content'),
        item: items,
    };
};
