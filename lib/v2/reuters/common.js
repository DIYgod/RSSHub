const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const topic = ctx.params.topic ?? (category === 'authors' ? 'reuters' : '');
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const rootUrl = 'https://www.reuters.com';
    const currentUrl = topic ? `${rootUrl}/${category}/${topic}/` : `${rootUrl}/${category}/`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);

    let items = $('.media-story-card__body__3tRWy a.media-story-card__heading__eqhp9, a.svelte-pxbp38, a.svelte-11dknnx, a.svelte-e21rsn')
        .slice(0, limit)
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('span.visually-hidden__hidden__2qXMW').remove();
            return {
                title: item.text(),
                link: new URL(item.prop('href'), rootUrl).href,
            };
        });
    if (!items.length) {
        const metadata = $('script#fusion-metadata').html();
        const metadataObj = JSON.parse(metadata.match(/Fusion.globalContent=(\{[\s\S]*?});/)[1]);
        const articles = metadataObj.arcResult?.articles ?? metadataObj.result?.articles ?? [];
        items = articles.map((article) => ({
            title: article.title,
            link: rootUrl + article.canonical_url,
        }));
    }
    items = await Promise.all(
        items.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                if (detailResponse.url.startsWith('https://www.reuters.com/investigates/')) {
                    const ldJson = JSON.parse(content('script[type="application/ld+json"]').text());
                    content('.special-report-article-container .container, #slide-dek, #slide-end, .share-in-article-container').remove();

                    item.title = ldJson.headline;
                    item.pubDate = parseDate(ldJson.dateCreated);
                    item.author = ldJson.creator;
                    item.category = ldJson.keywords;
                    item.description = content('.special-report-article-container').html();

                    return item;
                }

                const matches = content('script#fusion-metadata')
                    .text()
                    .match(/Fusion.globalContent=(\{[\s\S]*?});/);

                if (matches) {
                    const data = JSON.parse(matches[1]);

                    item.title = data.result.title || item.title;
                    item.description = art(path.join(__dirname, 'templates/description.art'), {
                        result: data.result,
                    });
                    item.pubDate = parseDate(data.result.display_time);
                    item.author = data.result.authors.map((author) => author.name).join(', ');
                    item.category = data.result.taxonomy.keywords;

                    return item;
                }

                content('.title').remove();
                content('.article-metadata').remove();

                item.title = content('meta[property="og:title"]').attr('content');
                item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*?)","dateModified/)[1]);
                item.author = detailResponse.data
                    .match(/{"@type":"Person","name":"(.*?)"}/g)
                    .map((p) => p.match(/"name":"(.*?)"/)[1])
                    .join(', ');
                item.description = content('article').html();

                return item;
            })
        )
    );

    ctx.state.data = {
        title: $('head title').text(),
        description: $('head meta[name=description]').attr('content'),
        image: 'https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default-512x512.png?d=116',
        link: currentUrl,
        item: items,
    };
};
