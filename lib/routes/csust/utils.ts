import { load } from 'cheerio';

import got from '@/utils/got';

export async function getNoticeContent(item: any) {
    const response = await got(item.link);
    const $ = load(response.body);

    const pageTitle = $('title').text().trim();
    const lastDash = pageTitle.lastIndexOf('-');
    if (lastDash > 0) {
        item.title = pageTitle.slice(0, lastDash).trim();
    }

    const $content = $('.v_news_content');
    if ($content.length) {
        $content.find('script, style, .vsbcontent_end, iframe').remove();
        $content.find('img[src], a[href]').each((_, el) => {
            const $el = $(el);
            const attr = el.tagName === 'img' ? 'src' : 'href';
            const val = $el.attr(attr);
            if (val) {
                $el.attr(attr, new URL(val, item.link).href);
            }
        });
        item.description = $content.html() || item.title;
    } else {
        item.description = item.title;
    }

    return item;
}
