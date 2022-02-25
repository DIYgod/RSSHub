const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const name = ctx.params.name ?? '摄影';
    const type = ctx.params.type ?? 'new';

    const rootUrl = 'https://www.lofter.com';
    const currentUrl = `${rootUrl}/tag/${name}/${type}`;

    const response = await got({
        method: 'get',
        url: currentUrl,
    });

    const $ = cheerio.load(response.data);

    $('.js-digest').remove();

    let title = $('a.j-crt').text();
    title = title === '最热' ? $('.select-recomm-type').text() : title;

    const items = $('div[data-blogid]')
        .map((_, item) => {
            item = $(item);

            const videos = item
                .find('.js-video')
                .toArray()
                .reduce((accumulator, currentValue) => accumulator + `<video src="${$(currentValue).attr('data-videourl')}" poster="${$(currentValue).attr('data-videoimg')}" controls="controls"></video>`, '');

            const images = item
                .find('.imgc img')
                .toArray()
                .reduce((accumulator, currentValue) => accumulator + `<img src="${$(currentValue).attr('data-origin') || $(currentValue).attr('src')}"/>`, '');

            const description = item.find('.js-content.ptag');

            return {
                author: item.attr('data-blognickname'),
                link: item.find('.isayc').attr('href'),
                title: item.find('.tit').text() || `${item.find('.w-who .ptag').text()}${description.text() ? `：${description.text()}` : ''}`,
                pubDate: parseDate(item.find('.isayc').attr('data-time') * 1),
                description: videos + images + description.html(),
                category: item
                    .find('.opta .opti')
                    .toArray()
                    .map((item) => $(item).text()),
            };
        })
        .get();

    ctx.state.data = {
        title: `${name} - ${title} | LOFTER`,
        link: currentUrl,
        item: items,
    };
};
