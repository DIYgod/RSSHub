import { load } from 'cheerio';

import { parseDate } from '@/utils/time';

const rootUrl = 'https://p-articles.com';

const ProcessFeed = (info, data) => {
    // const $ = cheerio.load(data);
    const $ = load(data);
    const author = $('div.detail_title_02 > h4 > a:nth-child(2)').text();
    info.author = author;

    const dateValue = $('div.detail_title_02 > h4 ').text();
    info.pubDate = parseDate(dateValue, 'YYYY-MM-DD', 8);

    const description = $('div.detail_contect_01').html();
    info.description = description;
    return info;
};

export { ProcessFeed, rootUrl };
