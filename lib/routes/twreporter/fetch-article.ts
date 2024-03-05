// @ts-nocheck
import { load } from 'cheerio';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

module.exports = async function fetch(address) {
    const res = await got(address);
    const capture = load(res.data);
    capture('.gIMvvS').remove();

    let metaInfoBox = capture('.ffAPnj')
        .filter((index) => index === 0)
        .get();

    // For photography
    if (metaInfoBox.length === 0) {
        metaInfoBox = capture('.deNvJY')
            .filter((index) => index === 0)
            .get();
    }

    const acquire = load(metaInfoBox);
    let time = acquire('.gimsRe').text();

    // For `photography`
    if (!time) {
        time = acquire('.kHluJP').text();
    }
    // # Author(s) of the article
    //
    // There exists two formats for this section.
    // 1. 文字 /...` with `摄影 / ..` in separate line, or
    // 2. just a simple line starts with `文/ ...`
    // For the first condition, we use a array
    // to record the list of author(s), and use
    // `；` to connect two lines.
    const authors = [];

    if (acquire('.loxoWO').text() === '') {
        for (const item of acquire('.flciyI').get()) {
            const $ = load(item);
            const job = $('.hGsNtm').text();
            // An article may have multiple authors
            const name = [];
            for (const item of $('.cidPTd > a').get()) {
                const $ = load(item);
                name.push($('.fJSaZP').text());
            }

            const author = job + '／' + name.join('，');
            authors.push(author);
        }
    } else {
        authors.push(acquire('.loxoWO').text());
    }
    const author = authors.join('；');

    // contents = cover photo + italic intro + text
    const contents = '<em>' + capture('.hxFBKc').html() + '</em><br>' + capture('.jONJYq').html();

    return {
        author,
        description: contents,
        link: address,
        guid: address,
        pubDate: parseDate(time, 'M/D/YYYY'),
    };
};
