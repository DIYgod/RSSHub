import { load } from 'cheerio';

import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const parseContent = (htmlString: string) => {
    const $ = load(htmlString);

    const title = $('h1.contents_title');
    const author = $('.contents_creator_txt');
    const time = $('.contents_info')
        .text()
        .match(/\d+\/\d+\/\d+ \d+:\d+:\d+/)![0];

    const audioUrl = htmlString.match(/"url":\s*"(https:\/\/cdn\.piapro\.jp\/mp3_a\/[^"]+)"/)?.[1];

    const description =
        ($('.contents_illust_img').html() ?? '') +
        ($('.contents_description').html() ?? '') +
        (audioUrl ? `${$('.contents_music_main_jackets_inner').html()}<br><audio src="${audioUrl}" controls loop></audio>` : '') +
        ($('.contents_text_txt').html() ?? '');

    return {
        title: title.text(),
        author: author.text(),
        description,
        pubDate: timezone(parseDate(time), 9),
    };
};
