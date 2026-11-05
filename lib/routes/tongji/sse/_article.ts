import { load } from 'cheerio'; // html parser

import got from '@/utils/got'; // get web content

export default async function getArticle(link: string) {
    const response = await got({
        method: 'get',
        url: link,
    });
    const data = response.data;

    const $ = load(data);
    const title = $('div.view-title').text();
    const content = $('.v_news_content').first().html() ?? $('#vsb_content').html();

    return {
        title: title || undefined,
        description: (content ?? '') + ($('ul[style]').html() ?? '') || undefined,
    };
}
