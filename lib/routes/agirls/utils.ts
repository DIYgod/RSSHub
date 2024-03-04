// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

const baseUrl = 'https://agirls.aotter.net';

const parseArticle = async (item) => {
    const detailResponse = await got(item.link);
    const content = load(detailResponse.data);

    item.category = [
        ...new Set(
            content('.ag-article__tag')
                .toArray()
                .map((e) => content(e).text().trim().replace('#', ''))
        ),
    ];
    const ldJson = JSON.parse(content('script[type="application/ld+json"]').text());

    item.description = content('.ag-article__content').html();
    item.pubDate = parseDate(ldJson['@graph'][0].datePublished); // 2023-07-05T12:11:36+08:00
    item.updated = parseDate(ldJson['@graph'][0].dateModified); // 2023-07-05T12:11:36+08:00
    item.author = ldJson['@graph'][0].author.map((a) => a.name).join(', ');

    return item;
};

module.exports = {
    baseUrl,
    parseArticle,
};
