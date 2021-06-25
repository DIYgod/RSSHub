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
    const list = $('.mod_playlist__item').get();
    const author = $('.my_show__name').text();
    const authorimg = $('.my_show__img').attr('src');
    const items = await Promise.all(
        list.map(async (item) => {
            const $ = cheerio.load(item);
            const link = $('a').attr('data-playurl');
            const item_info = await cache.getPlayInfo(ctx, link);

            const single = {
                title: $('.mod_playlist__work').text(),
                description: item_info.description,
                link: link,
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
