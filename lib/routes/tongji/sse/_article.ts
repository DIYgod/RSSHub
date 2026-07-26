import { load } from 'cheerio'; // html parser

import got from '@/utils/got'; // get web content

export default async function getArticle(item) {
    const response = await got({
        method: 'get',
        url: item.link,
    });
    const data = response.data;

    const $ = load(data);
    const title = $('div.view-title').text();
    const content = $('#vsb_content').html();

    item.title = title;
    item.description = content + ($('ul[style]').length ? $('ul[style]').html() : '');

    return item;
}
