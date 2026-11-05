import type { Cheerio } from 'cheerio';
import type { Element } from 'domhandler';
import { escapeAttribute } from 'entities';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const bbsOrigin = 'https://bbs.yamibo.com';

export function getDate(value: string | undefined): Date | undefined {
    if (!value) {
        return;
    }

    const date = parseDate(value);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
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

function resolveImageUrl(src: string | undefined) {
    if (!src || !URL.canParse(src, `${bbsOrigin}/`)) {
        return;
    }

    const url = new URL(src, `${bbsOrigin}/`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
}

function getEditingPanels($item: Cheerio<Element>) {
    return $item.find('i.pstatus').filter((_, element) => /^\s*本帖最后由 .*? 于 \d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2} 编辑\s*$/.test($item.find(element).text()));
}

export function getUpdated($item: Cheerio<Element>) {
    const calendar = getEditingPanels($item)
        .first()
        .text()
        .match(/\d{4}-\d{1,2}-\d{1,2} \d{2}:\d{2}/)?.[0];
    return getDate(calendar);
}

export function generateDescription($item: Cheerio<Element>, postId: string) {
    const content = $item.find(`#postmessage_${postId}`).parent();
    getEditingPanels($item).remove();
    content.find('img').each((_, img) => {
        const src = resolveImageUrl(img.attribs.zoomfile ?? img.attribs.src ?? img.attribs.file);
        if (src) {
            img.attribs.src = src;
        } else {
            content.find(img).remove();
        }
    });
    let description = content.html() ?? '';

    const images = $item.find('.pattl img').toArray();
    for (const img of images) {
        const src = resolveImageUrl(img.attribs.zoomfile ?? img.attribs.src ?? img.attribs.file);
        if (src) {
            description += `<img src="${escapeAttribute(src)}" />`;
        }
    }

    return description;
}
