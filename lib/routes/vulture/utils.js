const got = require('@/utils/got');
const cheerio = require('cheerio');

async function load(articleURL) {
    const response = await got.get(articleURL);
    const $ = cheerio.load(response.data);

    // get the metadata
    const title = $('meta[property="og:title"]').attr('content');
    const pubDate = $('meta[property="article:published_time"]').attr('content');
    const bylineString = 'by ' + $('meta[name="author"]').attr('content');
    const tags = $('meta[property="article:tag"]').attr('content').split(', ');

    // get the contents of the article
    const description = $('div.article-content');

    // remove the content that we don't want to show
    description.find('aside.related').remove();
    description.find('aside.article-details_heading-with-paragraph').remove();
    description.find('section.package-list').remove();
    description.find('div.source-links h2').remove();
    description.find('div.source-links svg').remove();
    description.find('div.mobile-secondary-area').remove();
    description.find('aside.newsletter-flex-text').remove();

    // add the tags to the end
    description.append('<br /><br />tags: ' + tags.join(', '));

    return {
        title: title,
        author: bylineString,
        pubDate: pubDate,
        link: articleURL,
        guid: articleURL,
        description: description.html(),
        tags: tags,
    };
}

async function ProcessFeed(htmlData, caches) {
    const $ = cheerio.load(htmlData);
    const allArticles = $('section.paginated-feed li.article');

    // limit the list to only 25 articles, to make sure that load times remain reasonable
    const articles = allArticles.slice(0, 25);

    const articleURLs = [];
    $(articles).each(function (index, article) {
        const articleLink = $(article).find('a.link-text');

        let articleURL = articleLink.attr('href');
        if (articleURL.startsWith('//www.')) {
            articleURL = 'https:' + articleURL;
        } else if (articleURL.startsWith('www.')) {
            articleURL = 'https://' + articleURL;
        }
        articleURLs.push(articleURL);
    });

    return await Promise.all(
        articleURLs.map(async (articleURL) => {
            const data = await caches.tryGet(articleURL, async () => await load(articleURL));
            return Promise.resolve(Object.assign({}, data));
        })
    );
}

function FilterItemsWithTags(feed, tagsToExclude) {
    return feed.filter(function (item) {
        for (const index in tagsToExclude) {
            const tagToExclude = tagsToExclude[index];
            const itemTags = item.tags;
            if (itemTags !== undefined && itemTags.includes(tagToExclude)) {
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
    let result = await ProcessFeed(htmlData, ctx.cache);

    // filter out specified tags
    if (tagsToExclude !== undefined) {
        const tagsToExcludeArray = tagsToExclude.split(',');
        result = FilterItemsWithTags(result, tagsToExcludeArray);
    }

    // get the description
    const $ = cheerio.load(htmlData);
    const description = $('meta[name="description"]').attr('content');

    return {
        title: title,
        link: url,
        description: description,
        item: result,
    };
};

module.exports = {
    getData,
};
