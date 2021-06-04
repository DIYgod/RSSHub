const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const mpName = ctx.params.mpName || '';

    const { data } = await got.get(`https://t.me/s/${id}`);
    const $ = cheerio.load(data);
    const list = $('.tgme_widget_message_wrap').slice(-20);

    const out = await Promise.all(
        list
            .map(async (index, item) => {
                item = $(item);

                let author;
                let title = item.find('.tgme_widget_message_text > a:nth-child(5)').text() || item.find('.tgme_widget_message_text > a:nth-child(2)').text();

                const all_text = item.find('.tgme_widget_message_text').text();
                const spaceIndex = all_text.indexOf(' ')
                const colonIndex = all_text.indexOf(':')
                if (spaceIndex !== -1 && colonIndex !== -1) {
                    author = all_text.slice(spaceIndex + 1, colonIndex);
                    if (!mpName) {
                        title = author + ': ' + title;
                    }
                }

                const link = item.find('.tgme_widget_message_text > a:nth-child(5)').attr('href') || item.find('.tgme_widget_message_text > a:nth-child(2)').attr('href');
                const pubDate = new Date(item.find('.tgme_widget_message_date time').attr('datetime')).toUTCString();

                const single = {
                    title,
                    pubDate,
                    link,
                    author,
                };

                if (link !== undefined) {
                    const value = await ctx.cache.get(link);
                    if (value) {
                        single.description = value;
                    } else {
                        try {
                            const reponse = await got.get(link);
                            const $ = cheerio.load(reponse.data);

                            single.description = $('.rich_media_content')
                                .html()
                                .replace(/data-src/g, 'src');
                            ctx.cache.set(link, single.description, 12 * 60 * 60);
                        } catch (err) {
                            single.description = item.find('.tgme_widget_message_text').html();
                        }
                    }
                }

                return Promise.resolve(single);
            })
            .get()
    );

    out.reverse();
    ctx.state.data = {
        title: mpName ? mpName : $('.tgme_channel_info_header_title').text(),
        link: `https://t.me/s/${id}`,
        item: mpName ? out.filter(item => item.author == mpName) : out,
        allowEmpty: true
    };
};
