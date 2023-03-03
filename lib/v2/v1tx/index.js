const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.v1tx.com';
    const response = await got(`${baseUrl}/wp-json/wp/v2/posts`, {
        searchParams: {
            per_page: ctx.query.limit ?? 100,
        },
    });

    const items = response.data.map((item) => {
        const $ = cheerio.load(item.content.rendered, null, false);
        $('figure > picture > source').remove();
        $('img').each((_, img) => {
            img.attribs.src = img.attribs.src.replace(/-1024x\d+\.jpg/, '.webp').replace('.jpg', '.webp');
            delete img.attribs.srcset;
        });
        return {
            title: item.title.rendered,
            link: item.link,
            guid: item.guid.rendered,
            description: $.html(),
            pubDate: parseDate(item.date_gmt),
        };
    });

    ctx.state.data = {
        title: 'v1tx - 发现实用工具与软件',
        description: 'v1tx.com 专注于发现新应用，推荐各种效率工具、软件、APP，包括Windows、Mac、Android、iOS、网页等多平台应用，让每个人找到适合的软件并掌握使用技巧',
        link: baseUrl,
        image: `${baseUrl}/wp-content/uploads/2018/10/cropped-Favicon.webp`,
        item: items,
    };
};
