const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const host = 'http://www.grad.sdu.edu.cn/';

module.exports = async (ctx) => {
    const link = url.resolve(host, 'default_xshd_news.site?isDto=&beanName=xshd_newsPageBean&typeCode=0108&pageSize=20&pageIndex=1');
    const response = await axios.get(link);

    const $ = cheerio.load(response.data);

    const list = $('#div_more_news a')
        .slice(0, 10)
        .map((i, e) => $(e).attr('href'))
        .get();

    const out = await Promise.all(
        list
            .filter((itemUrl) => itemUrl.startsWith('http'))
            .map(async (itemUrl) => {
                const cache = await ctx.cache.get(itemUrl);
                if (cache) {
                    return Promise.resolve(JSON.parse(cache));
                }

                const response = await axios.get(itemUrl);
                const $ = cheerio.load(response.data);

                const titleGroup = $('#newsTitle')
                    .children()
                    .text()
                    .split('\n');

                const single = {
                    title: titleGroup[0],
                    link: itemUrl,
                    author: '山东大学研究生院',
                    description: $('.newscontent_1').html(),
                    pubDate: new Date(titleGroup[2].slice(8)),
                };
                ctx.cache.set(itemUrl, JSON.stringify(single), 24 * 60 * 60);
                return Promise.resolve(single);
            })
    );

    ctx.state.data = {
        title: '山东大学研究生院学术活动',
        link,
        item: out,
    };
};
