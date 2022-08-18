const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const type = ctx.params.type === 'week' ? 1 : 2;
    const rootUrl = 'https://www.qianzhan.com/analyst/';

    const response = await got({
        method: 'get',
        url: rootUrl,
    });
    const $ = cheerio.load(response.data);
    const links = $('#div_hotlist ul[idx=' + type + '] a')
        .slice(0, 9)
        .map((_, item) => $(item).attr('href'));

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
        title: '前瞻经济学人 - ' + ctx.params.type === 'week' ? '周排行' : '月排行',
        link: rootUrl,
        item: items,
    };
};
