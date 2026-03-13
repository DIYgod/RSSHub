import { load } from 'cheerio';
import CryptoJS from 'crypto-js';

import { config } from '@/config';
import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

function getCookie(url: string): Promise<string> {
    return cache.tryGet(
        'sis001:cookie',
        async () => {
            const response = await got(url);
            const rsp = response.data;

            const regex = /toNumbers\("([a-fA-F0-9]+)"\)/g;
            const matches: string[] = [];
            let match: RegExpExecArray | null;

            while ((match = regex.exec(rsp)) !== null) {
                matches.push(match[1]);
            }

            if (matches.length !== 3) {
                return '';
            }

            const key = CryptoJS.enc.Hex.parse(matches[0]);
            const iv = CryptoJS.enc.Hex.parse(matches[1]);
            const encrypted = CryptoJS.enc.Hex.parse(matches[2]);

            const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, { iv, padding: CryptoJS.pad.NoPadding });

            return 'CeRaHigh1=' + decrypted.toString(CryptoJS.enc.Hex);
        },
        config.cache.routeExpire,
        false
    );
}

async function getThread(cookie: string, item: DataItem) {
    const response = await got(item.link, { headers: { cookie } });
    const $ = load(response.data);

    item.guid = item.link?.replace(/^https?:\/\/.+?\//, 'https://www.sis001.com/');
    item.category = $('.posttags a')
        .toArray()
        .map((a) => $(a).text());
    item.pubDate = timezone(
        parseDate(
            $('.postinfo')
                .eq(0)
                .text()
                .match(/发表于 (.*)\s*只看该作者/)[1],
            'YYYY-M-D HH:mm'
        ),
        8
    );
    $('div[id^=postmessage_] table, fieldset, .posttags, strong font, span:empty').remove();
    item.description =
        $('div[id^=postmessage_]')
            .eq(0)
            .html()
            ?.replaceAll('\n', '')
            .replaceAll(/\u3000{2}.+?(((?:<br>){2})|(&nbsp;))/g, (str) => `<p>${str.replaceAll('<br>', '')}</p>`)
            .replaceAll(/<p>\u3000{6,}(.+?)<\/p>/g, '<center><p style="text-align:center;">$1</p></center>')
            .replaceAll('&nbsp;', '')
            .replace(/<br><br> +<br><br>/, '') + ($('.defaultpost .postattachlist').html() ?? '');
    return item;
}

export { getCookie, getThread };
