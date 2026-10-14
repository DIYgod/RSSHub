import { load } from 'cheerio';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export const loadArticle = async (link) => {
    const resp = await got(link);
    const article = load(resp.body);

    const title = article('h1.entry-title').text();
    const description = article('.entry-content').html();
    const pubDate = parseDate(article('time')[0].attribs.datetime);
    const category = [
        ...new Set(
            article('footer.entry-meta a[href*="/category/"], footer.entry-meta a[href*="/tag/"]')
                .toArray()
                .map((tag) => article(tag).text())
        ),
    ];

    return {
        title,
        description,
        pubDate,
        category,
        link,
    };
};
