import { load } from 'cheerio';

import type { DataItem } from '@/types';
import got from '@/utils/got';

type NoticeItem = DataItem & { link: string };

export async function getNoticeContent(item: NoticeItem): Promise<NoticeItem> {
    const response = await got(item.link);
    const $ = load(response.body);
    const pageTitle = $('title').text();

    const $content = $('.v_news_content');
    $content.find('script, style, .vsbcontent_end').remove();
    $content.find('img[src], a[href]').each((_, element) => {
        const $element = $(element);
        const attribute = element.tagName === 'img' ? 'src' : 'href';
        $element.attr(attribute, new URL($element.attr(attribute)!, item.link).href);
    });

    return {
        ...item,
        title: pageTitle.slice(0, pageTitle.lastIndexOf('-')).trim(),
        description: $content.html()!,
    };
}
