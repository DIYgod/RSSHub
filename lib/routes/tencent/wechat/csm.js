const got = require('@/utils/got');
const date = require('@/utils/date');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const { id } = ctx.params;

    const link = `https://chuansongme.com/account/${id}`;

    const response = await got.get(link);

    const $ = cheerio.load(response.data);

    const items = await Promise.all(
        $('.feed_item')
            .slice(0, 10)
            .get()
            .map(async (e) => {
                const pubDate = date(`${$(e).find('.timestamp').text().trim()}`, 8);

                const link = `https://chuansongme.com${$(e).find('.question_link').attr('href')}`;

                const response = await ctx.cache.tryGet(link, async () => (await got.get(link)).data);

                const article = cheerio.load(response);

                article('[style="display: none;"], [style=" display: none;"], [style="display: none"]').each((i, e) => {
                    article(e).remove();
                });

                article('#js_content img').each((index, elem) => {
                    const $elem = article(elem);

                    const imgSrc = $elem.attr('data-original') || $elem.attr('src');
                    if (imgSrc) {
                        const realSrc = imgSrc.replace(/^https:\/\/img.chuansongme.com\//, 'https://mmbiz.qpic.cn/').replace(/^http.?\/\/img\d+.store.sogou.com.*url=(.*)$/, '$1');
                        $elem.attr('src', realSrc);
                    }
                });

                const single = {
                    title: article('#activity-name').text(),
                    link,
                    description: article('#js_content').html(),
                    pubDate,
                    author: article('#meta_content > span:nth-child(2)').text(),
                };

                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: `微信公众号 - ${$('.inline_editor_content').first().text().trim()}`,
        link,
        description: $('.inline_editor_content').last().text().trim(),
        item: items,
    };
};
