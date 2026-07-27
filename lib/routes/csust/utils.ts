import { load } from 'cheerio';

import type { DataItem } from '@/types';
import got from '@/utils/got';

type NoticeItem = DataItem & { link: string };

export async function getNoticeContent(item: NoticeItem): Promise<NoticeItem> {
    const response = await got(item.link);
    const $ = load(response.body);
    const pageTitle = $('title').text();

    const $content = $('.v_news_content');
    $content.find('style, .vsbcontent_end').remove();

    return {
        ...item,
        title: pageTitle.slice(0, pageTitle.lastIndexOf('-')).trim(),
        description: $content.html()!,
    };
}
