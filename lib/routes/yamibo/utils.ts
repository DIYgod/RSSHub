import type { Cheerio } from 'cheerio';
import type { Element } from 'domhandler';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const bbsOrigin = 'https://bbs.yamibo.com';

export function getDate(date: string): Date {
    return timezone(parseDate(date), 8);
}

type ThreadOptions = { ordertype?: string };
type ThreadData = { link: string; data: string };

export async function fetchThread(tid: string, options?: ThreadOptions): Promise<ThreadData> {
    const params = new URLSearchParams({ mod: 'viewthread', tid });
    if (options?.ordertype) {
        params.set('ordertype', options.ordertype);
    }
    const link = `${bbsOrigin}/forum.php?${params}`;
    const { auth, salt } = config.yamibo;
    const headers: HeadersInit = {};
    if (auth && salt) {
        headers.cookie = `EeqY_2132_saltkey=${salt}; EeqY_2132_auth=${auth}`;
    }
    const data = await ofetch<string>(link, { headers });
    return { link, data };
}

export function generateDescription($item: Cheerio<Element>, postId: string) {
    const content = $item.find(`#postmessage_${postId}`).parent();
    content.find('img').each((_, img) => {
        const src = img.attribs.zoomfile ?? img.attribs.src;
        img.attribs.src = `${bbsOrigin}/${src}`;
    });
    let description = content.html() ?? '';

    const images = $item.find('.pattl img').toArray();
    for (const img of images) {
        const src = img.attribs.zoomfile ?? img.attribs.src;
        description += `<img src="${bbsOrigin}/${src}" />`;
    }

    return description;
}
