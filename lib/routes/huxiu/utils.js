const cheerio = require('cheerio');
const date = require('@/utils/date');
const got = require('@/utils/got');

const ProcessFeed = async (list, cache) => {
    const host = 'https://www.huxiu.com';

    const items = await Promise.all(
        list.map(async (e) => {
            const link = new URL(e, host).href;

            const single = await cache.tryGet(link, async () => {
                const response = await got(link);

                const $ = cheerio.load(response.data);

                // const __INITIAL_STATE__ = Function(
                //     'let window={};' +
                //         $('*')
                //             .html()
                //             .match(/window\.__INITIAL_STATE__.*};/gm)[0] +
                //         'return window.__INITIAL_STATE__'
                // )();

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

                // if ('video_info' in __INITIAL_STATE__.articleDetail.articleDetail) {
                //     description += `<video height="100%" poster="${__INITIAL_STATE__.articleDetail.articleDetail.video_info.cover}" controls src="${__INITIAL_STATE__.articleDetail.articleDetail.video_info.hd_link}"></video>`;
                // }
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

            return single;
        })
    );

    return items;
};

module.exports = {
    ProcessFeed,
};
