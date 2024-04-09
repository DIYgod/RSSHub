const cheerio = require('cheerio');
const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.bjp.org.cn';
    const listUrl = `${baseUrl}/APOD/list.shtml`;

    const res = await got(listUrl);

    const $ = cheerio.load(res.data);

    const list = $('td[align=left] b')
        .toArray()
        .map((e) => {
            e = $(e);
            return {
                title: e.find('a').attr('title'),
                link: `${baseUrl}${e.find('a').attr('href')}`,
                pubDate: timezone(parseDate(e.find('span').text().replace('：', ''), 'YYYY-MM-DD'), 8),
            };
        });

    const items = await Promise.all(
        list.map((e) =>
            ctx.cache.tryGet(e.link, async () => {
                const { data } = await got.get(e.link);
                const $ = cheerio.load(data);

                e.description = $('.juzhong').html();

                return e;
            })
        )
    );
    ctx.state.data = {
        title: $('head title').text(),
        description: '探索宇宙！每天发布一张迷人宇宙的影像，以及由专业天文学家撰写的简要说明。',
        link: listUrl,
        item: items,
    };
};
