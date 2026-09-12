import { load } from 'cheerio';

import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

import { getAcwScV2ByArg1 } from '../5eplay/utils';

const picBaseUrl = 'https://imgoss.cnu.cc/';
const cookieKey = 'cnu:acw_sc__v2';

export const cnuFetch = async (url: string): Promise<string> => {
    const get = (cookie?: string | null) => ofetch(url, { responseType: 'text', headers: cookie ? { cookie: `acw_sc__v2=${cookie}` } : {} });

    const cachedCookie = await cache.get(cookieKey);
    const response = await get(cachedCookie);
    const arg1 = response.match(/var arg1='(.*?)'/)?.[1];
    if (!arg1) {
        return response;
    }

    const cookie = getAcwScV2ByArg1(arg1);
    await cache.set(cookieKey, cookie);

    return await get(cookie);
};

export const parseContent = (htmlString: string) => {
    const $ = load(htmlString);

    const author = $('.author-info > a');
    const time = $('.author-info > .timeago');
    const content = $('#work_body');

    const imgsJson = JSON.parse($('#imgs_json').text());
    content.append(imgsJson.map((element) => `<img src="${picBaseUrl}${element.img}?x-oss-process=style/content" /><div class="img_description">${element.content}</div><p>${element.text}</p>`).join(''));

    return {
        author: author.text().trim(),
        description: content.html(),
        pubDate: timezone(parseDate(time.text()), 8),
    };
};
