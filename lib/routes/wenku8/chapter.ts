// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
const iconv = require('iconv-lite');

export default async (ctx) => {
    const id = ctx.req.param('id');
    const index = Number.parseInt(id / 1000);

    const response = await got({
        method: 'get',
        url: `https://www.wenku8.net/novel/${index}/${id}/index.htm`,
        responseType: 'buffer',
    });

    const responseHtml = iconv.decode(response.data, 'gbk');

    const $ = load(responseHtml);

    const name = $('#title').text();

    const chapter_item = [];

    $('.ccss>a').each(function () {
        chapter_item.push({
            title: $(this).text(),
            link: `https://www.wenku8.net/novel/${index}/${id}/` + $(this).attr('href'),
        });
    });

    ctx.set('data', {
        title: `轻小说文库 ${name}`,
        link: `https://www.wenku8.net/book/${id}.htm`,
        item: chapter_item,
    });
};
