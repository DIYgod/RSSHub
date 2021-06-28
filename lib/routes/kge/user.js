const got = require('@/utils/got');
const cheerio = require('cheerio');
const cache = require('./cache');
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const userid = ctx.params.userid;
    const url = `https://node.kg.qq.com/personal?uid=${userid}`;
    const response = await got({
        method: 'get',
        url: url,
    });

    const $ = cheerio.load(response.body); // 使用 cheerio 加载返回的 HTML
    const author = $('.my_show__name').text();
    const authorimg = $('.my_show__img').attr('src');

    let source_data = '',
        ugc_list = [];
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
        ugc_list = source_data_obj && source_data_obj.data && source_data_obj.data.ugclist ? source_data_obj.data.ugclist : [];
    }
    const items = await Promise.all(
        ugc_list.map(async (item) => {
            const link = `https://node.kg.qq.com/play?s=${item.shareid}`;
            const item_info = await cache.getPlayInfo(ctx, item.shareid, item.ksong_mid);

            const single = {
                title: item.title || '',
                description: item_info.description,
                link: link,
                guid: `ksong:${item.ksong_mid}`,
                author: author,
                pubDate: timezone(parseDate(item_info.ctime * 1000), +8),
                itunes_item_image: item_info.itunes_item_image || authorimg,
                enclosure_url: item_info.enclosure_url,
                enclosure_type: 'audio/x-m4a',
            };

            return single;
        })
    );

    ctx.state.data = {
        title: $('title').text(),
        link: url,
        description: $('meta[name="description"]').attr('content') || $('title').text(),
        allowEmpty: true,
        item: items,
        image: authorimg,
        itunes_author: author,
        itunes_category: '全民k歌',
    };
};
