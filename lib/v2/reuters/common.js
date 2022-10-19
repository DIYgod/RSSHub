const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const topic = ctx.params.topic ?? (category === 'authors' ? 'reuters' : '');

    const rootUrl = 'https://www.reuters.com';
    const currentUrl = topic ? `${rootUrl}/${category}/${topic}/` : `${rootUrl}/${category}/`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);

    let list = $('.media-story-card__body__3tRWy a.media-story-card__heading__eqhp9')
        .toArray()
        .map((item) => {
            item = $(item);
            item.find('span.visually-hidden__hidden__2qXMW').remove();
            return {
                title: item.text(),
                link: rootUrl + item.prop('href'),
            };
        });
    if (!list.length) {
        const metadata = $('script#fusion-metadata').html();
        const metadataObj = JSON.parse(metadata.match(/Fusion.globalContent=(\{[\s\S]*?});/)[1]);
        const articles = metadataObj.arcResult?.articles ?? metadataObj.result?.articles ?? [];
        list = articles.map((article) => ({
            title: article.title,
            link: rootUrl + article.canonical_url,
        }));
    }
    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const detailResponse = await got(item.link);
                const content = cheerio.load(detailResponse.data);

                const data = JSON.parse(
                    content('script#fusion-metadata')
                        .text()
                        .match(/Fusion.globalContent=(\{[\s\S]*?});/)[1]
                );

                item.title = data.result.title || item.title;
                item.description = art(path.join(__dirname, 'templates/description.art'), {
                    result: data.result,
                });
                item.pubDate = parseDate(data.result.display_time);
                item.author = data.result.authors.map((author) => author.name).join(', ');
                item.category = data.result.taxonomy.keywords;

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
