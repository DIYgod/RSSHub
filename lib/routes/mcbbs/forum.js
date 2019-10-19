const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');

module.exports = async (ctx) => {
    const type = ctx.params.type;
    const info = utils.getForumInfo(type);
    if (!info) {
        throw Error('板块名或者板块ID错误！');
    }

    const response = await got(utils.forumUrl, {
        method: 'get',
        params: {
            mod: 'forumdisplay',
            fid: info.fid,
            filter: 'lastpost',
            orderby: 'lastpost',
        },
        baseUrl: utils.host,
    });
    const data = response.data;

    const $ = cheerio.load(data);
    const title = $('title').text();
    const list = $('#separatorline ~ tbody');
    const description = $('meta[name="description"]').text();
    const item = list
        .map((index, element) => {
            const title = $('.s', element).text();
            const href = $('.icn > a', element).attr('href');
            const link = `${utils.host}/${href}`;
            const postBy = $('.by', element);
            const author = $('cite', postBy[0]);
            const postDate = $('span[title]', postBy[0]);
            const endAuthor = $('cite', postBy[1]);
            const endDate = $('span[title]', postBy[1]);
            const description = `${author.html()}发表于${postDate.parent().html()}，最后由${endAuthor.html()}于${endDate.parent().html()}回复。`;
            const pubDate = new Date(`${endDate.attr('title')} GMT+0800`).toUTCString();

            const signle = {
                title: title,
                link: link,
                author: author.text(),
                description: description,
                pubDate: pubDate,
            };
            return signle;
        })
        .get();

    ctx.state.data = {
        title: title,
        link: response.url,
        description: description,
        allowEmpty: true,
        item: item,
    };
};
