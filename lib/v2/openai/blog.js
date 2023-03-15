const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const tag = ctx.params.tag || '';

    const rootUrl = 'https://openai.com';
    const blogRootUrl = 'https://openai.com/blog';
    const blogOriginUrl = `${rootUrl}/blog${tag === '' ? '' : `?topics=${tag}`}`;

    // Find API base URL
    const initResponse = await got({
        method: 'get',
        url: blogRootUrl,
    });

    let apiBaseUrl = initResponse.data
        .toString()
        .match(/(?<=TWILL_API_BASE:").+?(?=")/)[0]
        .replaceAll('\\u002F', '/');
    apiBaseUrl = apiBaseUrl + '/api/v1/blog-details';
    const apiUrl = new URL(apiBaseUrl);

    // Construct API query
    apiUrl.searchParams.append('sort', '-publicationDate,-createdAt');
    apiUrl.searchParams.append('page[size]', '5');
    apiUrl.searchParams.append('page[number]', '1');
    apiUrl.searchParams.append('include', 'media,topics,authors');
    if (tag) {
        apiUrl.searchParams.append('filter[topics][slugs][0]', tag);
    }

    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    const list = response.data.data.filter((entry) => entry.type === 'blog-details');

    const items = await Promise.all(
        list.map((item) => {
            const attributes = item.attributes;
            const textUrl = `${blogRootUrl}/${attributes.slug}`;
            return ctx.cache.tryGet(textUrl, async () => {
                const detailResponse = await got({
                    method: 'get',
                    url: textUrl,
                });
                const content = cheerio.load(detailResponse.data);
                const authors = content('[aria-labelledby="metaAuthorsHeading"] > li > a > span > span')
                    .toArray()
                    .map((entry) => content(entry).text())
                    .join(', ');

                content('.aside').remove();

                const imageSrc = attributes.seo.ogImageSrc;
                const imageAlt = attributes.seo.ogImageAlt;

                const article = art(path.join(__dirname, 'templates/article.art'), {
                    content: content('#content').html(),
                    imageSrc,
                    imageAlt,
                });

                return {
                    title: attributes.title,
                    author: authors,
                    description: article,
                    pubDate: attributes.createdAt,
                    category: attributes.tags.map((tag) => tag.title),
                    link: textUrl,
                };
            });
        })
    );

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    const title = `OpenAI Blog${tag ? ` - ${capitalize(tag)}` : ''}`;

    ctx.state.data = {
        title,
        link: blogOriginUrl,
        item: items,
    };
};
