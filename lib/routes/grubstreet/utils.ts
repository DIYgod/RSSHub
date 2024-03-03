// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';

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

function ProcessFeed(list, caches) {
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

                            bylineString = 'by ' + bylineNamesString;
                        }
                    }
                }

                const single = {
                    title: item.plaintextPrimaryHeadline,
                    link: itemUrl,
                    guid: itemUrl,
                    pubDate: item.date,
                };

                if (bylineString) {
                    single.author = bylineString;
                }

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

    // limit the list to only 25 articles, to make sure that load times remain reasonable
    const list = data.articles.slice(0, ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 25);
    const result = await ProcessFeed(list, cache);

    return {
        title,
        link: url,
        description,
        item: result,
    };
};

module.exports = {
    getData,
};
