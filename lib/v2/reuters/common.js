const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const category = ctx.params.category;
    const topic = ctx.params.topic ?? (category === 'authors' ? 'reuters' : '');
    const limit = ctx.query.limit ? parseInt(ctx.query.limit) : 20;

    const MUST_FETCH_BY_TOPICS = ['authors'];
    const section_id = `/${category}/${topic ? `${topic}/` : ''}`;
    const { title, description, rootUrl, response } = await (async () => {
        if (!MUST_FETCH_BY_TOPICS.includes(category)) {
            const rootUrl = 'https://www.reuters.com/pf/api/v3/content/fetch/articles-by-section-alias-or-id-v1';
            const response = await got(rootUrl, {
                searchParams: {
                    query: JSON.stringify({
                        offset: 0,
                        size: limit,
                        section_id,
                        website: 'reuters',
                    }),
                },
            }).json();
            return {
                title: response.result.section.title,
                description: response.result.section.section_about,
                rootUrl,
                response,
            };
        } else {
            const rootUrl = 'https://www.reuters.com/pf/api/v3/content/fetch/articles-by-topic-v1';
            const response = await got(rootUrl, {
                searchParams: {
                    query: JSON.stringify({
                        offset: 0,
                        size: limit,
                        topic_url: section_id,
                        website: 'reuters',
                    }),
                },
            }).json();

            return {
                title: `${response.result.topics[0].name} | Reuters`,
                description: response.result.topics[0].entity_id,
                rootUrl,
                response,
            };
        }
    })();

    let items = response.result.articles.map((e) => ({
        title: e.title,
        link: new URL(e.canonical_url, rootUrl).href,
    }));

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
        title,
        description,
        image: 'https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default-512x512.png?d=116',
        link: `https://www.reuters.com${section_id}`,
        item: items,
    };
};
