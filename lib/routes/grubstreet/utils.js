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

    return {
        description: description.html(),
    };
}

function ProcessFeed(list, caches) {
    return Promise.all(
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
                title: item.plaintextPrimaryHeadline,
                link: itemUrl,
                author: bylineString,
                guid: itemUrl,
                pubDate: item.date,
            };

            const other = await caches.tryGet(itemUrl, () => load(itemUrl));

            return Promise.resolve(Object.assign({}, single, other));
        })
    );
}

const getData = async (ctx, url, title, description) => {
    const response = await got({
        method: 'get',
        url,
        headers: {
            Referer: url,
        },
    });

    const data = response.data;

    // limit the list to only 25 articles, to make sure that load times remain reasonable
    const list = data.articles.slice(0, 25);
    const result = await ProcessFeed(list, ctx.cache);

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
