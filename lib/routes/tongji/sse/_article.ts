import got from '@/utils/got'; // get web content
import { load } from 'cheerio'; // html parser

export default async function getArticle(item) {
    const response = await got({
        method: 'get',
        url: item.link,
    });
    const data = response.data;

    const $ = load(data);
    const title = $('div.view-title').text();
    const content = $('#vsb_content').html();
    $('[name="_newscontent_fromname"] ul a').each((_, e) => {
        const href = $(e).attr('href');
        if (href.startsWith('/')) {
            $(e).attr('href', new URL(href, item.link).href);
        }
    });

    item.title = title;
    item.description = content + ($('ul[style]').length ? $('ul[style]').html() : '');

    return item;
}
