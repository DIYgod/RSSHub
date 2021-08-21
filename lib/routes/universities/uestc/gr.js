const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://gr.uestc.edu.cn/tongzhi/';
    const baseIndexUrl = 'https://gr.uestc.edu.cn';

    const response = await got.get(baseIndexUrl);

    const $ = cheerio.load(response.data);

    const url_list = [];
    $('[href^="/tongzhi/"]').each((_, item) => {
        url_list.push(baseIndexUrl + item.attribs.href);
    });

    const out = await Promise.all(
        url_list.map(async (news_url) => {
            const news_detail = await ctx.cache.tryGet(news_url, async () => {
                const result = await got.get(news_url);

                const $ = cheerio.load(result.data);

                const title = '[' + $('.over').text() + '] ' + $('div.title').text();
                const author = $('.info').text().split('|')[1].trim().substring(3);
                const date = new Date($('.info').text().split('|')[0].trim().substring(4)).toUTCString();
                const description = $('.content').html();

                return {
                    title,
                    link: news_url,
                    author,
                    pubDate: date,
                    description,
                };
            });
            return Promise.resolve(news_detail);
        })
    );

    ctx.state.data = {
        title: '电子科技大学研究生院通知公告',
        link: baseUrl,
        item: out,
    };
};
