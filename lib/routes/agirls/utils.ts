import { load } from 'cheerio';

import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://agirls.aotter.net';

const parseArticle = async (item) => {
    const detailResponse = await ofetch(item.link);
    const content = load(detailResponse);

    item.category = [
        ...new Set(
            content('.ag-article__tag')
                .toArray()
                .map((e) => content(e).text().replace('#', ''))
        ),
    ];
    const ldJson = JSON.parse(content('script[type="application/ld+json"]').text());
    const newsArticle = ldJson['@graph'].find((g) => g['@type'] === 'NewsArticle');

    item.description = content('.ag-article__content').html();
    item.pubDate = parseDate(newsArticle.datePublished); // 2023-07-05T12:11:36+08:00
    item.updated = parseDate(newsArticle.dateModified); // 2023-07-05T12:11:36+08:00
    item.author = newsArticle.author.map((a) => a.name).join(', ');

    return item;
};

export { baseUrl, parseArticle };
