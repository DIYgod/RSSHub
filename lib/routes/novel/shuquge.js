const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const baseUrl = 'http://www.sizhicn.com/txt/';
// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const id = ctx.params.id; // 小说id

    const response = await got({
        method: 'get',
        url: `${baseUrl}${id}/index.html`,
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'utf-8');
    const $ = cheerio.load(responseHtml);
    const title = $('.listmain>dl>dt').eq(0).text();
    const description = $('.intro').text();
    const cover_url = $('.cover>img').eq(0).attr('src');
    const list = $('.listmain dd').slice(0, 9);
    const chapter_item = list
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: `${baseUrl}${id}/${e.attribs.href}`,
        }))
        .get();

    const items = await Promise.all(
        chapter_item.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const response = await got({
                method: 'get',
                url: item.link,
                responseType: 'buffer',
            });

            const responseHtml = iconv.decode(response.data, 'utf-8');
            const $ = cheerio.load(responseHtml);

            const description = $('#content').html();

            const single = {
                title: item.title,
                description,
                link: item.link,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `书趣阁 ${title}`,
        link: `${baseUrl}${id}/index.html`,
        image: cover_url,
        description: description,
        item: items,
    };
};
