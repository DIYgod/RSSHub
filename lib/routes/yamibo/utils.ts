import type { Cheerio, Element } from 'cheerio';
import { JSDOM } from 'jsdom';

import { config } from '@/config';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const bbsOrigin = 'https://bbs.yamibo.com';

export function getDate(date: string): Date {
    return timezone(parseDate(date), 8);
}

export async function fetchThread(
    tid: string,
    options?: {
        ordertype?: string;
        _dsign?: string;
    },
    retry = 0
): Promise<{
    link: string;
    data?: string;
}> {
    const { auth, salt } = config.yamibo;
    const params = new URLSearchParams();
    params.set('mod', 'viewthread');
    params.set('tid', tid);
    if (options?.ordertype) {
        params.set('ordertype', options.ordertype);
    }
    if (options?._dsign) {
        params.set('_dsign', options._dsign);
    }
    const link = `https://bbs.yamibo.com/forum.php?${params.toString()}`;

    const headers: HeadersInit = {};

    if (auth && salt) {
        headers.cookie = `EeqY_2132_saltkey=${salt}; EeqY_2132_auth=${auth}`;
    }

    const data = await ofetch<string>(link, { headers });

    // sometimes may trigger anti-crawling measures
    if (data.startsWith('<script type="text/javascript">') && retry <= 3) {
        let script = data.match(/<script type="text\/javascript">([\S\s]*?)<\/script>/)![1];
        script = script.replace(/= location;|=location;/, '=fakeLocation;');
        script = script.replace('location.replace', 'foo');
        script = script.replace('location.assign', 'foo');
        script = script.replace(/location\[[^\]]*]\(/, 'foo(');
        script = script.replace(/location\[[^\]]*]=/, 'window.locationValue=');
        script = script.replace('location.href=', 'window.locationValue=');
        script = script.replace('location=', 'window.locationValue=');
        const dom = new JSDOM(
            `<script>
                function foo(value) { window.locationValue = value; };
                fakeLocation = { href: '', replace: foo, assign: foo };
                Object.defineProperty(fakeLocation, 'href', {
                    set: function (value) {
                        window.locationValue = value;
                    }
                });
                ${script}
            </script>`,
            {
                runScripts: 'dangerously',
            }
        );
        const locationValue = dom.window.locationValue;
        if (locationValue) {
            const searchParams = new URLSearchParams(locationValue);
            const _dsign = searchParams.get('_dsign');
            if (_dsign) {
                options = {
                    ...options,
                    _dsign,
                };
            }
        }
        return await fetchThread(tid, options, ++retry);
    }

    return {
        link,
        data,
    };
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
