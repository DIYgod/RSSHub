const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    let rootUrl = 'https://www.qianzhan.com/analyst/';
    const titles = {
        all: '最新文章',
        220: '研究员专栏',
        627: '规划师专栏',
        329: '观察家专栏',
    };

    if (ctx.params.type !== 'all') {
        rootUrl = rootUrl + 'list/' + ctx.params.type + '.html';
    }

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const links = $('.ptb30.bb1e.clf .f22 a').map((_, item) => $(item).attr('href'));

    const items = await Promise.all(
        links.map(
            (_, item) =>
                new Promise((resolve) => {
                    ctx.cache.tryGet(item, async () => {
                        const detailResponse = await got({
                            method: 'get',
                            url: item,
                        });
                        const $ = cheerio.load(detailResponse.data);
                        const description = $('#div_conbody').html();
                        const title = $('#h_title').text();
                        const pubDate = $('#pubtime_baidu').text().split('• ')[1];
                        const author = $('.bljjxue').text().match(/\S+/)[0];
                        resolve({
                            title,
                            link: item,
                            description,
                            pubDate,
                            author,
                        });
                    });
                })
        )
    );

    ctx.state.data = {
        title: '前瞻经济学人 - ' + titles[ctx.params.type],
        link: rootUrl,
        item: items,
    };
};
