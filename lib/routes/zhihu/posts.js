const got = require('@/utils/got');
const utils = require('./utils');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const usertype = ctx.params.usertype;

    const response = await got({
        method: 'get',
        url: `https://www.zhihu.com/${usertype}/${id}/posts`,
        headers: {
            ...utils.header,
            Referer: `https://www.zhihu.com/${usertype}/${id}/`,
        },
    });
    const data = response.data;
    const $ = cheerio.load(data);
    const jsondata = $('#js-initialData');
    const authorname = $('.ProfileHeader-name').text();
    const authordescription = $('.ProfileHeader-headline').text();

    const parsed = JSON.parse(jsondata.html());
    const articlesdata = parsed.initialState.entities.articles;

    const list = [];
    Object.keys(articlesdata).forEach((v) => {
        list.push(articlesdata[v]);
    });

    ctx.state.data = {
        title: `${authorname}的知乎文章`,
        link: `https://www.zhihu.com/${usertype}/${id}/posts`,
        description: authordescription,
        item:
            list.length > 0 &&
            list.map((item) => ({
                title: String(item.title),
                description: item.content,
                link: item.url,
                pubDate: parseDate(item.updated * 1000),
            })),
    };
};
