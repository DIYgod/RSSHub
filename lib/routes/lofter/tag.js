const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const name = ctx.params.name || '摄影';
    const type = ctx.params.type || 'new';

    const rootUrl = 'http://www.lofter.com';
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

            const category = [];
            let videos = '',
                images = '';

            item.find('.js-video').each(function () {
                videos += `<video src="${$(this).attr('data-videourl')}" poster="${$(this).attr('data-videoimg')}" controls="controls"></video>`;
            });

            item.find('.imgc img').each(function () {
                images += `<img src="${$(this).attr('data-origin') || $(this).attr('src')}"/>`;
            });

            item.find('.opta .opti').each(function () {
                category.push($(this).text());
            });

            const description = item.find('.js-content.ptag');

            return {
                category,
                author: item.attr('data-blognickname'),
                link: item.find('.isayc').attr('href'),
                title: item.find('.tit').text() || `${item.find('.w-who .ptag').text()}${description.text() ? `：${description.text()}` : ''}`,
                pubDate: parseDate(item.find('.isayc').attr('data-time') * 1),
                description: videos + images + description.html(),
            };
        })
        .get();

    ctx.state.data = {
        title: `${name} - ${title}｜LOFTER`,
        link: currentUrl,
        item: items,
    };
};
