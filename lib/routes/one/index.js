const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://wufazhuce.com/',
        headers: {
            Referer: 'http://wufazhuce.com/',
        },
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const list = [$('.item.active'), $('.corriente')[0], $('.corriente')[1]];
    const itemMap = ['「图片」', '「文字」', '「问答」'];

    const out = await Promise.all(
        list.map(async (item, i) => {
            const url = $(item).find('a').attr('href');
            const single = {
                title: itemMap[i] + $(item).find('a').text().replace(/\s+/g, ' ').trim(),
                link: url,
                description: '',
            };
            const detail = await got({
                method: 'get',
                url,
                headers: {
                    Referer: 'http://wufazhuce.com/',
                },
            });
            {
                const data = detail.data;
                const $ = cheerio.load(data);
                single.description = $('.tab-content').html();
            }
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: $('title').text(),
        link: 'http://wufazhuce.com/',
        item: out,
        description: '复杂世界里, 一个就够了. One is all.',
    };
};
