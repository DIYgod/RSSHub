const got = require('@/utils/got');
const { toTitleCase } = require('@/utils/common-utils');
const { getApiUrl, parseArticle } = require('./common');

module.exports = async (ctx) => {
    const tag = ctx.params.tag || '';

    const rootUrl = 'https://openai.com';
    const blogRootUrl = 'https://openai.com/blog';
    const blogOriginUrl = `${rootUrl}/blog${tag === '' ? '' : `?topics=${tag}`}`;

    const apiUrl = new URL('/api/v1/blog-details', await getApiUrl());

    // Construct API query
    apiUrl.searchParams.append('sort', '-publicationDate,-createdAt');
    apiUrl.searchParams.append('page[size]', '20');
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
            return parseArticle(ctx, blogRootUrl, attributes);
        })
    );

    const title = `OpenAI Blog${tag ? ` - ${toTitleCase(tag)}` : ''}`;

    ctx.state.data = {
        title,
        link: blogOriginUrl,
        item: items,
    };
};
