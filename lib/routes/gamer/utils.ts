import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const fetchItem = <T extends { link: string }>(item: T) =>
    cache.tryGet(item.link, async () => {
        const response = await ofetch(item.link);
        const $ = load(response);
        const content = $('#article_content, .card'); // .card is a login wall

        content.find('.form__buttonbar').remove();
        content.find('a[href^="https://ref.gamer.com.tw/redir.php"]').each((_, a) => {
            const url = new URL($(a).attr('href')!).searchParams.get('url');
            if (url) {
                $(a).attr('href', url);
            }
        });

        content.prepend(
            $('#div_illustration img')
                .toArray()
                .map((img) => `<img src="${$(img).parent().attr('data-src')}">`)
                .join('')
        );

        return { ...item, description: content.html() };
    });

export const ProcessFeed = async (url: string) => {
    const response = await ofetch(url);
    const $ = load(response);

    const title = $('title').text();

    const list = $('.platform-info-box')
        .toArray()
        .map((item) => {
            const $item = $(item);
            const a = $item.find('.HOME-mainwrap1 h1 > a');

            return {
                title: a.text(),
                link: a.attr('href')!,
                author: $item.find('.mainbox-author').text(),
                pubDate: timezone(parseDate($item.find('.caption-text').not('.height-limit').text().split('｜', 2)[1]), 8),
            };
        });

    const items = await Promise.all(list.map((item) => fetchItem(item)));

    return { title, items };
};
