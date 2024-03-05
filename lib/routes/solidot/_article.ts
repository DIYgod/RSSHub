// @ts-nocheck
import got from '@/utils/got'; // get web content
import { load } from 'cheerio'; // html parser
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

module.exports = async function get_article(url) {
    const domain = 'https://www.solidot.org';

    if (/^\/.*$/.test(url)) {
        url = domain + url;
    }
    const response = await got({
        method: 'get',
        url,
    });
    const data = response.data;
    const $ = load(data);

    const date_raw = $('div.talk_time').clone().children().remove().end().text();
    const date_str_zh = date_raw.replaceAll(/^[^`]*发表于(.*分)[^`]*$/g, '$1'); // use [^`] to match \n
    const date_str = date_str_zh
        .replaceAll(/[年月]/g, '-')
        .replaceAll('时', ':')
        .replaceAll(/[分日]/g, '');

    const title = $('div.block_m > div.ct_tittle > div.bg_htit > h2').text();
    const category = $('div.icon_float > a').attr('title');
    const author = $('div.talk_time > b')
        .text()
        .replaceAll(/^来自(.*)部门$/g, '$1');
    $('div.ct_tittle').remove();
    $('div.talk_time').remove();
    const description = $('div.block_m')
        .html()
        .replaceAll(/(href.*?)<u>(.*?)<\/u>/g, `$1$2`)
        .replaceAll('href="/', 'href="' + domain + '/')
        // Preserve the not extremely disturbing donation ad
        // to support the site.
        .replaceAll(/(<img.*liiLIZF8Uh6yM.*?>)/g, `<br><br>$1`);

    const item = {
        title,
        pubDate: timezone(parseDate(date_str), +8),
        author,
        link: url,
        description,
        category,
    };
    return item;
};
