const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = {
    getPlayInfo: async (ctx, link) => {
        const data = await ctx.cache.tryGet(link, async () => {
            const response = await got({
                method: 'get',
                url: link,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
                },
            });
            const $ = cheerio.load(response.data);
            const description = $('.singer_say__cut').html();
            const name = $('.play_name').html();

            let source_data = '',
                enclosure_url = '',
                comments = [];
            $('script').each(function () {
                if ($(this).html() && $(this).html().search('window.__DATA__') === 0) {
                    // 去除json字符串前后的多余字符
                    source_data = $(this).html().replace('window.__DATA__ = ', '').trim();
                    source_data = source_data.substring(0, source_data.length - 1);
                    return false;
                }
            });
            if (source_data) {
                const source_data_obj = JSON.parse(source_data.replace(0, source_data.length - 1));
                enclosure_url = source_data_obj ? source_data_obj.detail.playurl : '';
                comments = source_data_obj ? source_data_obj.detail.comments : [];
            }
            return { name, link, description, enclosure_url, itunes_item_image: $('.play_img').attr('src'), comments };
        });
        return data;
    },
};
