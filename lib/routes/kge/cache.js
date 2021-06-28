const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = {
    getPlayInfo: async (ctx, shareid, ksong_mid = '') => {
        const link = `https://node.kg.qq.com/play?s=${shareid}`;
        const cache_key = ksong_mid ? `ksong:${ksong_mid}` : link;
        const data = await ctx.cache.tryGet(cache_key, async () => {
            const response = await got({
                method: 'get',
                url: link,
            });
            const $ = cheerio.load(response.data);
            const description = $('.singer_say__cut').html();
            const name = $('.play_name').html();

            let source_data = '',
                enclosure_url = '',
                ctime = 0,
                ksong_mid = '',
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
                ksong_mid = source_data_obj ? source_data_obj.detail.ksong_mid : '';
                ctime = source_data_obj ? source_data_obj.detail.ctime : 0;
                comments = source_data_obj ? source_data_obj.detail.comments : [];
            }
            return { name, link, description, enclosure_url, ksong_mid, ctime, itunes_item_image: $('.play_img').attr('src'), comments };
        });
        return data;
    },
};
