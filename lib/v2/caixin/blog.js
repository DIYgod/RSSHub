const got = require('@/utils/got');
const cheerio = require('cheerio');
const { isValidHost } = require('@/utils/valid-host');
const { parseDate } = require('@/utils/parse-date');
const { parseBlogArticle } = require('./utils');

module.exports = async (ctx) => {
    const { column } = ctx.params;
    if (!isValidHost(column)) {
        throw Error('Invalid column');
    }
    const link = `https://${column}.blog.caixin.com`;
    const { data: response } = await got(link);
    const $ = cheerio.load(response);
    const authorId = $('script[type="text/javascript"]')
        .text()
        .match(/window\.authorId = (\d+);/)[1];
    const authorName = $('script[type="text/javascript"]')
        .text()
        .match(/window\.authorName = "(.*)";/)[1];
    const avatar = $('script[type="text/javascript"]')
        .text()
        .match(/avatar: "(.*?)",/)[1];
    const introduce = $('script[type="text/javascript"]')
        .text()
        .match(/introduce: "(.*?)"\n/)[1];

    const {
        data: { data },
    } = await got('https://blog.caixin.com/blog-api/post/posts', {
        searchParams: {
            page: 1,
            size: ctx.query.limit ? parseInt(ctx.query.limit) : 20,
            content: '',
            authorId,
            sort: 'publishTime',
            direction: 'DESC',
        },
    });

    const posts = data.map((item) => ({
        title: item.title,
        description: item.brief,
        author: item.displayName,
        link: item.guid.replace('http://', 'https://'),
        pubDate: parseDate(item.publishTime, 'x'),
    }));

    const items = await Promise.all(posts.map((item) => parseBlogArticle(item, ctx.cache.tryGet)));

    ctx.state.data = {
        title: `财新博客 - ${authorName}`,
        link,
        description: introduce,
        image: avatar,
        item: items,
    };
};
