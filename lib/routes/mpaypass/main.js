const got = require('../../utils/got');
const cheerio = require('cheerio');

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
                link: $(this).find('#pic a').attr('href'),
                pic: $(this).find('#pic img').attr('src'),
                time: $(this).find('#time').text(),
            };
            return info;
        })
        .get();

    const out = await Promise.all(
        list.map(async (info) => {
            const title = info.title;
            let date = info.time.toString();
            date = date.substring(2, date.length);
            const link = info.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got.get(link);
            const $ = cheerio.load(response.data);
            const newsbody = $('div.newsbody').html();

            const single = {
                title: title,
                link: link,
                pubDate: date,
                description: newsbody,
            };

            ctx.cache.set(link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );

    ctx.state.data = {
        title: `移动支付网-${title_cn}`,
        link: title_url,
        item: out,
    };
};
