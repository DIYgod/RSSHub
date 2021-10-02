const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const asyncPool = require('tiny-async-pool');

const baseUrl = 'https://www.ptwxz.com/bookinfo/';

// 获取小说的最新章节列表
module.exports = async (ctx) => {
    // 小说id
    const id1 = ctx.params.id1;
    const id2 = ctx.params.id2;
    const id = id1 + '/' + id2;

    const response = await got({
        method: 'get',
        url: `${baseUrl}${id}.html`,
        headers: {
            Referer: `${baseUrl}${id}.html`,
        },
        responseType: 'buffer',
    });
    const responseHtml = iconv.decode(response.data, 'gbk');
    const $ = cheerio.load(responseHtml);

    const title = $('span>h1').text();

    const list = $('.grid>tbody>tr>td>li');

    const chapter_item = list
        .find('a')
        .map((_, e) => ({
            title: e.children[0].data,
            link: e.attribs.href,
            // pubDate // no date info found
        }))
        .get();

    const items = await asyncPool(3, chapter_item, async (item) => {
        const cache = await ctx.cache.get(item.link);
        if (cache) {
            return Promise.resolve(JSON.parse(cache));
        }

        const response = await got({
            method: 'get',
            url: `https://www.ptwxz.com/${item.link}`,
            responseType: 'buffer',
        });

        const responseHtml = iconv.decode(response.data, 'GBK');
        const $ = cheerio.load(responseHtml);

        // remove all unwanted elements
        // TODO: cleaner solution to rip text from body
        $('div').remove();
        $('h1').remove();
        $('table').remove();
        $('center').remove();
        $('table').remove();
        $('script').remove();

        const description = $('body').html();

        const single = {
            title: item.title,
            description,
            link: item.link,
        };
        ctx.cache.set(item.link, JSON.stringify(single));
        return Promise.resolve(single);
    });


    ctx.state.data = {
        title,
        link: `${baseUrl}${id}.html`,
        description: '',
        item: items,
    };
};