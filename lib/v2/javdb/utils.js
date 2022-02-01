const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = {
    ProcessItems: async (ctx, currentUrl, title) => {
        const domain = ctx.query.domain ?? 'javdb7.com';
        const rootUrl = `https://${domain}`;

        const response = await got({
            method: 'get',
            url: `${rootUrl}${currentUrl}`,
        });

        const $ = cheerio.load(response.data);

        $('.tags, .tag-can-play').remove();

        let items = $('.grid-item a')
            .slice(0, ctx.query.limit ? parseInt(ctx.query.limit) : 20)
            .toArray()
            .map((item) => {
                item = $(item);
                return {
                    title: item.text(),
                    link: `${rootUrl}${item.attr('href')}`,
                    pubDate: parseDate(item.find('.meta').text()),
                };
            });

        items = await Promise.all(
            items.map((item) =>
                ctx.cache.tryGet(item.link, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.link,
                    });

                    const content = cheerio.load(detailResponse.data);

                    item.enclosure_type = 'application/x-bittorrent';
                    item.enclosure_url = content('#magnets-content button[data-clipboard-text]').first().attr('data-clipboard-text');

                    content('icon').remove();
                    content('#modal-review-watched, #modal-comment-warning, #modal-save-list').remove();
                    content('.review-buttons, .copy-to-clipboard, .preview-video-container, .play-button').remove();

                    content('.preview-images img').each(function () {
                        content(this).removeAttr('data-src');
                        content(this).attr('src', content(this).parent().attr('href'));
                    });

                    item.category = content('.panel-block .value a')
                        .toArray()
                        .map((v) => content(v).text());
                    item.author = content('.panel-block .value').last().parent().find('.value a').first().text();
                    item.description = content('.cover-container, .column-video-cover').html() + content('.movie-panel-info').html() + content('#magnets-content').html() + content('.preview-images').html();

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
