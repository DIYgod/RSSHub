import { load } from 'cheerio';

import type { DataItem } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import { getRouteLimit } from '@/utils/route-limit';

async function loadContent(link) {
    const response = await got(link);
    const $ = load(response.data);

    const description = $('div.article-content');

    // remove the content that we don't want to show
    description.find('aside.related').remove();
    description.find('aside.article-details_heading-with-paragraph').remove();
    description.find('section.package-list').remove();
    description.find('div.source-links h2').remove();
    description.find('div.source-links svg').remove();
    description.find('div.mobile-secondary-area').remove();
    description.find('aside.newsletter-flex-text').remove();

    return {
        description: description.html(),
    };
}

function processFeed(list, caches) {
    return Promise.all(
        list.map((item) =>
            caches.tryGet(item.canonicalUrl, async () => {
                const itemUrl = item.canonicalUrl.replace('http://', 'https://');

                let bylineString;
                if (item.byline) {
                    const byline = item.byline[0];

                    if (byline && byline.names) {
                        const bylineNames = byline.names.map((name) => name.text);

                        if (bylineNames && bylineNames.length > 0) {
                            const bylineNamesString = bylineNames.join(', ');

                            bylineString = bylineNamesString;
                        }
                    }
                }

                const single: DataItem = {
                    title: item.plaintextPrimaryHeadline,
                    link: itemUrl,
                    guid: itemUrl,
                    pubDate: item.date ? parseDate(item.date) : undefined,
                    author: bylineString,
                };

                const { description } = await loadContent(itemUrl);
                single.description = description;

                return single;
            })
        )
    );
}

const getData = async (ctx, url, title, description) => {
    const response = await got(url);

    const data = response.data;

    const limit = getRouteLimit(ctx, 25);
    const datesKnown = data.articles.every((article) => article.date && Number.isFinite(parseDate(article.date).getTime()));
    if (ctx.req.query('sorted') !== 'false' && datesKnown) {
        data.articles.sort((a, b) => Number(parseDate(b.date)) - Number(parseDate(a.date)));
    }
    const list = data.articles.slice(0, datesKnown || ctx.req.query('sorted') === 'false' ? limit : Math.max(25, limit));
    const result = await processFeed(list, cache);

    return {
        title,
        link: 'https://www.grubstreet.com/',
        language: 'en' as const,
        description,
        item: result,
    };
};

export default { getData };
