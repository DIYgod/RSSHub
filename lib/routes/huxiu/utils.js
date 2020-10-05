const cheerio = require('cheerio');
const date = require('@/utils/date');
const got = require('@/utils/got');
const url = require('url');

const ProcessFeed = async (list, cache) => {
    const host = 'https://www.huxiu.com';

    const items = await Promise.all(
        list.map(async (e) => {
            const link = url.resolve(host, e);

            const single = await cache.tryGet(link, async () => {
                const response = await got.get(link);

                const $ = cheerio.load(response.data);

                $('.article__content')
                    .find('.lazyImg')
                    .each((i, e) => {
                        $(e).attr('src', $(e).attr('_src'));
                    });

                $('.article__content')
                    .find('.text-big-title')
                    .each((i, e) => (e.tagName = 'h3'));

                $('p').each(function () {
                    if ($(this).find('img').length === 0 && $(this).text().match(/^\s*$/)) {
                        $(this).remove();
                    }
                });
                $('img.dialog_add_wxxy_qrcode_icon').remove();

                let description = '';

                const videoMatch = response.data.match(/"hd_link":"(.*)","duration/);
                if (videoMatch !== null) {
                    description += `<video height="100%" controls="controls" src="${videoMatch[1].replace(/\\u002F/g, '/')}"></video>`;
                }
                if ($('.top-img').html() !== null) {
                    description += $('.top-img').html();
                }

                return {
                    title: $('.article__title').text().trim(),
                    description: description + $('.article__content').html(),
                    pubDate: date($('.article__time').text(), 8),
                    author: $('.author-info__username').text(),
                    link,
                };
            });

            return Promise.resolve(single);
        })
    );

    return items;
};

module.exports = {
    ProcessFeed,
};
