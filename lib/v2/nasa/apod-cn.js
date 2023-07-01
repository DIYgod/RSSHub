const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const rootUrl = `https://www.nasachina.cn/astronomy-picture-of-the-day`;
    const response = await got({
        method: 'get',
        url: rootUrl,
    });

    const $ = cheerio.load(response.data);

    const list = $('div.elementor-posts-container article')
        .map((_, el) => {
            const a = $(el).find('h3.elementor-post__title a');
            return {
                title: a.text(),
                link: a.attr('href'),
            };
        }).get();

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: item.link,
                });
                const content = cheerio.load(detailResponse.data);

                const description = content('main article').html();
                const dateText = content('time.updated').attr('datetime');
                const pubDate = dateText ? parseDate(dateText) : new Date();

                const single = {
                    title: item.title,
                    description,
                    pubDate,
                    link: item.link,
                };
                return single;
            })
        )
    );

    ctx.state.data = {
        title: 'NASA中文 - 天文·每日一图',
        link: rootUrl,
        item: items,
    };
};
