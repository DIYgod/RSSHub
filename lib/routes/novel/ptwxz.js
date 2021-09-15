const got = require('@/utils/got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');

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

    const list = $('.grid>tbody>tr>td>li>a');

    ctx.state.data = {
        title,
        link: `${baseUrl}${id}.html`,
        description: '',
        item:
            list &&
            list
                .map((index, item) => {
                    item = $(item);

                    return {
                        title: item[0].children[0].data,
                        description: '',
                        link: item.attr('href'),
                    };
                })
                .get(),
    };
};
