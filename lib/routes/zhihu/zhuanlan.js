const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const listRes = await got({
        method: 'get',
        url: `https://www.zhihu.com/api/v4/columns/${id}/items`,
        headers: {
            ...utils.header,
            Referer: `https://zhuanlan.zhihu.com/${id}`,
        },
    });

    const infoRes = await got.get(`https://zhuanlan.zhihu.com/${id}`);
    const $ = cheerio.load(infoRes.data);
    const title = $('.css-zyehvu').text();
    const description = $('.css-1bnklpv').text();

    const item = listRes.data.data.map((item) => {
        const $ = cheerio.load(item.content);
        $('img').css('max-width', '100%');

        let title = '';
        let link = '';
        let author = '';
        let pubDate = '';

        if (item.type === 'answer') {
            title = item.question.title;
            author = item.question.author.name;
            link = `https://www.zhihu.com/question/${item.question.id}/answer/${item.id}`;
            pubDate = new Date(item.created_time * 1000);
        } else if (item.type === 'article') {
            title = item.title;
            link = item.url;
            author = item.author.name;
            pubDate = new Date(item.created * 1000);
        }
        return {
            title,
            link,
            description: $.html(),
            pubDate,
            author,
        };
    });

    ctx.state.data = {
        description,
        item,
        title: `知乎专栏-${title}`,
        link: `https://zhuanlan.zhihu.com/${id}`,
    };
};
