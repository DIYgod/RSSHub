const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

const baseUrl = 'https://www.ptwxz.com/bookinfo/';
const timezone = require('@/utils/timezone');
const { parseDate } = require('@/utils/parse-date');

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

    const chapter_item = $('#content li a')
        .map((_, item) => {
            item = $(item);
            const date = item.attr('title').match(/更新时间:(.*)/)[1]; // "10-04 00:17"
            return {
                title: item.text(),
                link: item.attr('href'),
                pubDate: timezone(parseDate(date, 'MM-DD HH:mm'), +8),
            };
        })
        .get();
    const items = await Promise.all(
        chapter_item.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
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
                    pubDate: item.pubDate,
                };
                return single;
            })
        )
    );

    ctx.state.data = {
        title,
        link: `${baseUrl}${id}.html`,
        description: '',
        item: items,
    };
};
