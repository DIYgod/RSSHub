const got = require('@/utils/got');
const cheerio = require('cheerio');

const rootUrl = 'https://javdb.com';

module.exports = {
    rootUrl: rootUrl,
    ProcessItems: async (ctx, currentUrl, title) => {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = cheerio.load(response.data);

        $('.tags').remove();

        const list = $('.grid-item a')
            .slice(0, 5)
            .map((_, item) => {
                item = $(item);
                return {
                    title: item.text(),
                    link: `${rootUrl}${item.attr('href')}`,
                    pubDate: new Date(item.find('.meta').text()).toUTCString(),
                };
            })
            .get();

        const items = await Promise.all(
            list.map(
                async (item) =>
                    await ctx.cache.tryGet(item.link, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: item.link,
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
            link: currentUrl,
            item: items,
        };
    },
};
