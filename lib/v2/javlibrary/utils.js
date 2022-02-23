const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

const rootUrl = 'https://www.javlibrary.com';

module.exports = {
    rootUrl,
    defaultMode: '1',
    defaultGenre: 'amjq',
    defaultLanguage: 'ja',

    ProcessItems: async (language, currentUrl, tryGet) => {
        const response = await got({
            method: 'get',
            url: currentUrl,
        });

        const $ = cheerio.load(response.data);

        $('.toolbar, .info, .videoinfo').remove();

        let items = $('.videotextlist, #video_comments')
            .find('a')
            .toArray()
            .filter((i) => $(i).parent().hasClass('video') || $(i).parent().get(0).tagName === 'strong')
            .map((item) => {
                item = $(item);

                const table = item.parentsUntil('table');
                const link = `${rootUrl}/${language}/${item.attr('href').replace(/^\.\//, '')}`;

                return {
                    link, // url to target content.
                    url: link.replace(/video.*\.php/, ''), // url to the video page.

                    title: item.text(),
                    description: table.find('textarea').text(),
                    pubDate: parseDate(table.find('.date').text()),
                };
            });

        items = await Promise.all(
            items.map((item) =>
                tryGet(item.url, async () => {
                    const detailResponse = await got({
                        method: 'get',
                        url: item.url,
                    });

                    const content = cheerio.load(detailResponse.data);

                    content('.icn_edit, .btn_videoplayer, a[rel="bookmark"]').remove();
                    content('span').each(function () {
                        if (/^icn_/.test(content(this).attr('class'))) {
                            content(this).remove();
                        }
                    });

                    item.author = content('.star')
                        .toArray()
                        .map((star) => content(star).text())
                        .filter((star) => star !== '')
                        .join(',');
                    item.category = content('a[rel]')
                        .toArray()
                        .map((tag) => content(tag).text())
                        .filter((tag) => tag !== '');
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        cover: content('#video_jacket_img').attr('src'),
                        info: content('#video_info')
                            .html()
                            .replace(/span><span/g, 'span>,&nbsp;<span'),
                        comment: item.description?.replace(/\[img\]/g, '<img src="')?.replace(/\[\/img\]/g, '"/>'),
                        thumbs: content('.previewthumbs img')
                            .toArray()
                            .map((img) => content(img).attr('src').replace(/-/g, 'jp-')),
                        videos: [...new Set(detailResponse.data.match(/(http[\w\d:/]+\.mp4)/g))],
                    });
                    item.pubDate = item.pubDate.toString() === 'Invalid Date' ? parseDate(content('#video_date').find('.text').text()) : item.pubDate;

                    delete item.url;

                    return item;
                })
            )
        );

        return {
            title: $('title').text(),
            link: currentUrl,
            item: items,
            allowEmpty: true,
        };
    },
};
