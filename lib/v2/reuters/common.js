const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const topic = ctx.params.topic ?? (category === 'authors' ? 'reuters' : '');

    const rootUrl = 'https://www.reuters.com';
    const currentUrl = topic ? `${rootUrl}/${category}/${topic}/` : `${rootUrl}/${category}/`;
    const response = await got(currentUrl);
    const $ = cheerio.load(response.data);

    let list = $('.media-story-card__body__3tRWy a.media-story-card__heading__eqhp9')
        .map((_, item) => {
            item = $(item);
            item.find('span.visually-hidden__hidden__2qXMW').remove();
            return {
                title: item.text(),
                link: rootUrl + item.prop('href'),
            };
        })
        .get();
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

                item.title = content('meta[property="og:title"]').attr('content') || item.title;
                item.description = content('p[data-testid="paragraph-0"]').text();
                item.pubDate = parseDate(content('meta[name="article:published_time"]').attr('content'));
                item.author = content('meta[name="article:author"]').attr('content');

                return item;
            })
        )
    );

    ctx.state.data = {
        title: topic ? `Reuters - ${category} - ${topic}` : `Reuters - ${category}`,
        link: currentUrl,
        item: items,
    };
};
