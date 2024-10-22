import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';
import { Browser } from 'puppeteer';

const baseUrl = 'https://www.sis001.com';

async function getThread(browser: Browser, item) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        request.resourceType() === 'document' ? request.continue() : request.abort();
    });
    await page.goto(item.link, {
        waitUntil: 'domcontentloaded',
    });
    const response = await page.content();
    const $ = load(response);

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
