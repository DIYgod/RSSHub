const got = require('@/utils/got');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const { q, order = 'latest' } = ctx.params;
    const key = config.pixabay?.key ?? '7329690-bbadad6d872ba577d5a358679';
    const baseUrl = 'https://pixabay.com';

    const data = await ctx.cache.tryGet(
        `pixabay:search:${q}:${order}`,
        async () => {
            const { data } = await got(`${baseUrl}/api/`, {
                searchParams: {
                    key,
                    q,
                    order,
                    per_page: ctx.query.limit ?? 200,
                },
            });
            return data;
        },
        Math.max(config.cache.contentExpire, 24 * 60 * 60), // required by Pixabay API
        false
    );

    const items = data.hits.map((item) => {
        const { pageURL, tags, user } = item;
        return {
            title: pageURL
                .substring(pageURL.lastIndexOf('/', pageURL.lastIndexOf('/') - 1) + 1, pageURL.lastIndexOf('/'))
                .replace(/(-\d+)$/, '')
                .replace(/-/g, ' '),
            description: art(path.join(__dirname, 'templates/img.art'), { item }),
            link: pageURL,
            category: tags.split(', '),
            author: user,
        };
    });

    ctx.state.data = {
        title: `Search ${q} - Pixabay`,
        description: 'Download & use free nature stock photos in high resolution ✓ New free images everyday ✓ HD to 4K ✓ Best nature pictures for all devices on Pixabay',
        link: `${baseUrl}/images/search/${q}/${order === 'latest' ? '?order=latest' : ''}`,
        image: `https://pixabay.com/apple-touch-icon.png`,
        language: 'en',
        item: items,
    };
};
