import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const baseUrl = 'https://www.sis001.com';

async function getThread(item) {
    const response = await got(item.link);
    const $ = load(response.data);

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

export { baseUrl, getThread };
