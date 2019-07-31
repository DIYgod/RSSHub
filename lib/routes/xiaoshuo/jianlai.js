const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const baseUrl = 'http://www.jianlaixiaoshuo.com';
// 获取小说的最新章节列表
module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: `${baseUrl}`,
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'utf-8');
    const $ = cheerio.load(responseHtml);
    const title = $('.btitle>h1>a')
        .eq(0)
        .text();
    const list = $('.chapterlist dd').slice(-1, -10);
    const chapter_item = list
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: e.attribs.href,
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
                url: `${baseUrl}${item.link}`,
                responseType: 'buffer',
            });

            const responseHtml = iconv.decode(response.data, 'utf-8');
            const $ = cheerio.load(responseHtml);


            const single = {
                title: item.title,
                link: item.link,
            };
            ctx.cache.set(item.link, JSON.stringify(single));
            return Promise.resolve(single);
        })
    );
    ctx.state.data = {
        title: `${title}`,
        link: `${baseUrl}`,
        description: `大千世界，无奇不有。我陈平安，唯有一剑，可搬山，倒海，降妖，镇魔，敕神，摘星，断江，摧城，开天！`,	
        item: items,
    };
};
