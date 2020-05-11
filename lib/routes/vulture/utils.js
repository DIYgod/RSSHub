const got = require('@/utils/got');
const cheerio = require('cheerio');

async function load(link) {
    const response = await got.get(link);
    const $ = cheerio.load(response.data);

    const description = $('div.article-content');

    // remove the content that we don't want to show
    description.find('aside.related').remove();
    description.find('aside.article-details_heading-with-paragraph').remove();
    description.find('section.package-list').remove();
    description.find('div.source-links h2').remove();
    description.find('div.source-links svg').remove();
    description.find('div.mobile-secondary-area').remove();
    description.find('aside.newsletter-flex-text').remove();

    // get the tags
    const tagElements = $('div.tags > ul > li > a:not(.more)');
    const tags = tagElements
        .map(function () {
            return $(this).text().toLowerCase();
        })
        .get();

    return {
        description: description.html(),
        tags: tags,
    };
}

async function ProcessFeed(list, caches) {
    return await Promise.all(
        list.map(async (item) => {
            const itemUrl = item.canonicalUrl;

            let bylineString = '';
            if (item.byline) {
                const byline = item.byline[0];
                const bylineNames = byline.names.map((name) => name.text);
                const bylineNamesString = bylineNames.join(', ');

                bylineString = 'by ' + bylineNamesString;
            }

            const single = {
                title: item.primaryHeadline,
                link: itemUrl,
                author: bylineString,
                guid: itemUrl,
                pubDate: item.date,
            };

            const other = await caches.tryGet(itemUrl, async () => await load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
}

function FilterItemsWithTags(feed, tagsToExclude) {
    return feed.filter(function (item) {
        for (const index in tagsToExclude) {
            const tagToExclude = tagsToExclude[index];
            if (item.tags.includes(tagToExclude)) {
                return false;
            }
        }
        return true;
    });
}

const getData = async (ctx, url, title, tagsToExclude) => {
    const htmlResponse = await got({
        method: 'get',
        url: url,
        headers: {
            Referer: url,
        },
    });

    const htmlData = htmlResponse.data;

    const $ = cheerio.load(htmlData);
    let dataUri = $('section.paginated-feed').attr('data-uri');

    if (dataUri.startsWith('www.')) {
        dataUri = 'https://' + dataUri;
    }

    // get the raw data
    const response = await got({
        method: 'get',
        url: dataUri,
        headers: {
            Referer: dataUri,
        },
    });

    const data = response.data;

    // limit the list to only 25 articles, to make sure that load times remain reasonable
    const list = data.articles.slice(0, 25);

    let result = await ProcessFeed(list, ctx.cache);

    // filter out specified tags
    if (tagsToExclude !== undefined) {
        const tagsToExcludeArray = tagsToExclude.split(',');
        result = FilterItemsWithTags(result, tagsToExcludeArray);
    }

    return {
        title: title,
        link: url,
        description: $('meta[name="description"]').attr('content'),
        item: result,
    };
};

module.exports = {
    getData,
};
