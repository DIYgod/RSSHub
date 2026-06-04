import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

async function loadArticle(link) {
    const resp = await got(link);
    const article = load(resp.body);

    const title = article('h1.entry-title').text().trim();
    const description = article('.entry-content').html() ?? '';
    const pubDate = parseDate(article('time')[0].attribs.datetime);

    return {
        title,
        description,
        pubDate,
        link,
    };
}

export default loadArticle;
