const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const baseUrl = 'https://www.aac.moj.gov.tw';

module.exports = async (ctx) => {
    const { type } = ctx.params;
    const url = `${baseUrl}/7204/7246/?Page=1&PageSize=40${type ? `&type=${type}` : ''}`;
    const response = await got(url);
    const $ = cheerio.load(response.data);
    $('.num').remove();
    const list = $('.list ul li a')
        .toArray()
        .map((item) => {
            item = $(item);
            const isDownload = /檔案下載/.test(item.attr('title'));
            const title = isDownload ? item.text().trim() : item.attr('title');
            return {
                title,
                link: new URL(item.attr('href'), baseUrl).href,
                isDownload,
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                if (!item.isDownload) {
                    const response = await got(item.link);
                    const $ = cheerio.load(response.data);

                    item.pubDate = timezone(parseDate($('.info time').attr('datetime'), 'YYYY-MM-DD HH:mm:ss'), +8);
                    $('.info, button').remove();
                    item.description = $('.cp').html() + ($('.lightbox_slider').length ? $('.lightbox_slider').html() : '') + ($('.file_download').length ? $('.file_download').html() : '');
                }
                delete item.isDownload;
                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        link: url,
        item: items,
        language: 'zh-TW',
    };
};
