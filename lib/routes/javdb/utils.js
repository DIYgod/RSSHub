const got = require('@/utils/got');
const cheerio = require('cheerio');

let rootUrl = 'https://javdb.com';

module.exports = {
    ProcessItems: async (ctx, currentUrl, title) => {
        let data;

        try {
            const response = await got({
                method: 'get',
                url: `${rootUrl}${currentUrl}`,
            });
            data = response.data;
        } catch (err) {
            rootUrl = rootUrl.replace('javdb', 'javdb7');
            const response = await got({
                method: 'get',
                url: `${rootUrl}${currentUrl}`,
            });
            data = response.data;
        }

        const $ = cheerio.load(data);

        $('.tags').remove();

        const list = $('.grid-item a')
            .slice(0, 15)
            .map((_, item) => {
                item = $(item);
                return {
                    title: item.text(),
                    link: `${rootUrl}${item.attr('href')}`,
                    pubDate: Date.parse(item.find('.meta').text()),
                };
            })
            .get();

        const items = await Promise.all(
            list.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        F: item.link,
                    });
                    const content = cheerio.load(detailResponse.data);

                    item.enclosure_url = content('#magnets-content button[data-clipboard-text]').eq(0).attr('data-clipboard-text');
                    item.enclosure_type = 'application/x-bittorrent';

                    content('icon, .review-buttons, .copy-to-clipboard').remove();
                    content('#modal-review-watched, #modal-save-list').remove();
                    content('.video-cover').eq(1).remove();

                    content('img.video-cover').attr('src', content(this).parent().attr('href'));

                    content('.preview-images img').each(function () {
                        content(this).removeAttr('data-src');
                        content(this).attr('src', content(this).parent().attr('href'));
                    });

                    content('#preview-video').css('display', 'block');

                    item.description = content('.movie-info-panel .columns').html() + content('#magnets-content').html() + content('.preview-images').html();

                    return item;
                })
            )
        );

        const htmlTitle = $('title').text();
        const subject = htmlTitle.indexOf('|') === -1 ? '' : htmlTitle.split('|')[0];

        return {
            title: subject === '' ? title : `${subject} - ${title}`,
            link: `${rootUrl}${currentUrl}`,
            item: items,
        };
    },
};
