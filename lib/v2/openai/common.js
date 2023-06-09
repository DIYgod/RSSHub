const got = require('@/utils/got');
const cheerio = require('cheerio');
const { art } = require('@/utils/render');
const path = require('path');

const getApiUrl = async () => {
    const blogRootUrl = 'https://openai.com/blog';

    // Find API base URL
    const initResponse = await got({
        method: 'get',
        url: blogRootUrl,
    });

    const apiBaseUrl = initResponse.data
        .toString()
        .match(/(?<=TWILL_API_BASE:").+?(?=")/)[0]
        .replaceAll('\\u002F', '/');

    return new URL(apiBaseUrl);
};

const parseArticle = (ctx, rootUrl, attributes) =>
    ctx.cache.tryGet(attributes.slug, async () => {
        const textUrl = `${rootUrl}/${attributes.slug}`;
        const detailResponse = await got({
            method: 'get',
            url: textUrl,
        });
        let content = cheerio.load(detailResponse.data);

        const authors = content('[aria-labelledby="metaAuthorsHeading"] > li > a > span > span')
            .toArray()
            .map((entry) => content(entry).text())
            .join(', ');

        // Leave out comments
        const comments = content('*')
            .contents()
            .filter(function () {
                return this.nodeType === 8;
            });
        comments.remove();

        content = content('#content');

        const imageSrc = attributes.seo.ogImageSrc;
        const imageAlt = attributes.seo.ogImageAlt;

        const article = art(path.join(__dirname, 'templates/article.art'), {
            content,
            imageSrc,
            imageAlt,
        });

        // Not all article has tags
        attributes.tags = attributes.tags || [];

        return {
            title: attributes.title,
            author: authors,
            description: article,
            pubDate: attributes.createdAt,
            category: attributes.tags.map((tag) => tag.title),
            link: textUrl,
        };
    });

module.exports = {
    getApiUrl,
    parseArticle,
};
