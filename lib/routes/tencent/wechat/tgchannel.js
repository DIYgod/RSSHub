const axios = require('@/utils/axios');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const { data } = await axios.get(`https://t.me/s/${id}`);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap');

    const out = await Promise.all(
        list
            .map((index, item) => {
                item = $(item);
                const title = item.find('.tgme_widget_message_text > a:nth-child(2)').text();
                const link = item.find('.tgme_widget_message_text > a:nth-child(2)').attr('href');
                const pubDate = new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString();
                const description = item.find('.tgme_widget_message_text').html();

                const single = {
                    title,
                    pubDate,
                    link,
                    description,
                };

                return single;
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
