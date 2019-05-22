const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const { data } = await axios.get(`https://t.me/s/${id}`);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap');

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);
                const title = item.find('.tgme_widget_message_text > a:nth-child(2)').text();
                const link = item.find('.tgme_widget_message_text > a:nth-child(2)').attr('href');
                const pubDate = new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString();

                const single = {
                    title,
                    pubDate,
                    link,
                };

                // 有的时候会出现某一项解析不出来，所以加判断防止出错
                if (link !== undefined) {
                    const value = await ctx.cache.get(link);
                    if (value) {
                        single.description = value;
                    } else {
                        const reponse = await axios.get(link);
                        const $ = cheerio.load(reponse.data);

                        single.description = $('.rich_media_content')
                            .html()
                            .replace(/data-src/g, 'src');
                        ctx.cache.set(link, single.description, 12 * 60 * 60);
                    }
                }

                return Promise.resolve(single);
            })
            .get()
    );

    out.reverse();
    ctx.state.data = {
        title: $('.tgme_channel_info_header_title').text(),
        link: `https://t.me/s/${id}`,
        item: out,
    };
};
