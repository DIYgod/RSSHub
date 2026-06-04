import { load } from 'cheerio';

import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

const rootUrl = 'https://p-articles.com';

const ProcessFeed = (info, data) => {
    // const $ = cheerio.load(data);
    const $ = load(data);
    const author = $('div.detail_title_02 > h4 > a:nth-child(2)').text().trim();
    info.author = author;

    const dateValue = $('div.detail_title_02 > h4 ').text().trim();
    info.pubDate = timezone(parseDate(dateValue), +8);

    const description = $('div.detail_contect_01').html();
    info.description = description;
    return info;
};

export { ProcessFeed, rootUrl };
