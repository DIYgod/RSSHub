const got = require('@/utils/got');
const cheerio = require('cheerio');

const notice_type = {
    isso: { title: 'UTDallas - International Student Services', url: 'https://www.utdallas.edu/ic/isso/' },
};

module.exports = async (ctx) => {
    // const type = ctx.params.type || 'isso';
    const type = 'isso';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36',
            // cookie: await getCookie(ctx),
        },
        url: notice_type[type].url,
    });

    const $ = cheerio.load(response.data);

    const list = $('.c6 > p ')
        .map(function () {
            if ($(this).find('span').text() !== '') {
                const info = {
                    title: $(this).find('span').text(),
                    description: $(this).next().text(),
                    // link: ,
                    // date: new Date().toUTCString(),
                };
                return info;
            } else {
                return null;
            }
        })
        .get();

    // console.log(list);

    const out = await Promise.all(
        list.map(async (item) => {
            const single = {
                title: item.title,
                description: item.description,
            };
            return Promise.resolve(single);
        })
    );

    // console.log(out);

    ctx.state.data = {
        title: notice_type[type].title,
        description: notice_type[type].title,
        link: notice_type[type].url,
        item: out,
    };
};
