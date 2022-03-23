const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

module.exports = async (ctx) => {
    let title_url = '';
    const { type = '' } = ctx.params;
    if (type) {
        title_url = `http://www.mpaypass.com.cn/${type}.html`;
    } else {
        title_url = 'http://www.mpaypass.com.cn';
    }

    const response = await got({
        method: 'get',
        url: title_url,
    });

    const data = response.data;

    const $ = cheerio.load(data);

    let title_cn = '';
    if (type) {
        title_cn = $(`a[href="http://www.mpaypass.com.cn/${type}.html"]`).text();
    } else {
        title_cn = '最新文章';
    }
    const list = $('.newslist')
        .map(function () {
            const info = {
                title: $(this).find('#title').text(),
                link: $(this).find('#title').find('a').attr('href'),
                time: $(this).find('#time').text(),
                category: $(this)
                    .find('#keywords')
                    .find('a')
                    .toArray()
                    .map((e) => $(e).text().trim()),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map((info) =>
            ctx.cache.tryGet(info.link, async () => {
                const response = await got(info.link);
                const $ = cheerio.load(response.data);
                const newsbody = $('div.newsbody').html();

                return {
                    title: info.title,
                    link: info.link,
                    pubDate: timezone(parseDate(info.time), +8),
                    description: newsbody,
                    category: info.category,
                };
            })
        )
    );

    ctx.state.data = {
        title: `移动支付网-${title_cn}`,
        link: title_url,
        item: out,
    };
};
