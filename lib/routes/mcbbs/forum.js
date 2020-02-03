const got = require('@/utils/got');
const cheerio = require('cheerio');
const utils = require('./utils');
const queryString = require('query-string');

module.exports = async (ctx) => {
    const type = ctx.params.type;

    const response = await got(utils.forumUrl, {
        method: 'get',
        searchParams: queryString.stringify({
            mod: 'forumdisplay',
            fid: type,
            // 最新帖子
            filter: 'lastpost',
            orderby: 'lastpost',
        }),
        prefixUrl: utils.host,
    });
    const data = response.data;
    const $ = cheerio.load(data);

    const title = $('title').text();
    const list = $('#separatorline ~ tbody');
    const description = $('meta[name="description"]').attr('content');
    const item = list
        .map((index, element) => {
            const title = $('.s', element).text();
            const href = $('.icn > a', element).attr('href');
            const link = `${utils.host}/${href}`;
            const postBy = $('.by', element);
            const author = $('cite', postBy[0]);
            const postDate = $('em', postBy[0]);
            const endAuthor = $('cite', postBy[1]);
            const endDate = $('em', postBy[1]);
            const description = `${author.html()}发表于${postDate.html()}，最后由${endAuthor.html()}于${endDate.html()}回复。`;
            // mcbbs 表示时间有两种格式
            const dateText = $('span[title]', endDate).attr('title') || endDate.text();
            const pubDate = new Date(`${dateText} GMT+0800`).toUTCString();
            const category = $('.new > em', element).text();

            const signle = {
                title: title,
                link: link,
                author: author.text(),
                description: description,
                pubDate: pubDate,
                category: category,
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
