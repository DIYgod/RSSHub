const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const baseUrl = 'https://www.jiaoliudao.com';

module.exports = async (ctx) => {
    const { data } = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ? parseInt(ctx.query.limit) : 100,
        },
    });

    const items = data.map((item) => {
        const $ = cheerio.load(item.content.rendered, null, false);
        $('img').each((_, img) => {
            if (img.attribs['data-original']) {
                img.attribs.src = img.attribs['data-original'];
                delete img.attribs['data-original'];
            }
        });
        return {
            title: item.title.rendered,
            description: $.html(),
            pubDate: parseDate(item.date_gmt),
            link: item.link,
        };
    });

    ctx.state.data = {
        title: '交流岛资源网-专注网络资源收集',
        image: `${baseUrl}/favicon.ico`,
        link: baseUrl,
        item: items,
    };
};
