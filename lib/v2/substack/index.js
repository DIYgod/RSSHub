const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

const SUBSTACK_CATEGORIES = require('./substack-categories');
const SUBSTACK_API_BASE_URL = 'https://substack.com/api/v1';

/**
 * This route allows subscribing Substack "Explore" categories, available via https://substack.com/browse.
 *
 * Substack currently does not offer a public developer API, so the internal API utilized on the Substack website is used here.
 * Since it is not an "official" API, keep in mind that the API calls might break at any time.
 */
module.exports = async (ctx) => {
    const { category, allowPaid = 'false', limit = '' } = ctx.params;

    const mappedCategory = SUBSTACK_CATEGORIES[category];
    if (!mappedCategory) {
        throw Error('Invalid Substack category. Please check the docs on how to set a correct category.');
    }

    let url;
    if (category === 'staff-picks') {
        url = `${SUBSTACK_API_BASE_URL}/reader/posts/staff-picks`;
    } else {
        url = `${SUBSTACK_API_BASE_URL}/trending?category_id=${mappedCategory.id}${limit ? `&limit=${limit}` : ''}`;
    }

    const { data } = await got(url, {
        headers: {
            accept: '*/*',
        },
    });

    let posts = data.posts.map((post) => ({
        title: post.title,
        link: post.canonical_url,
        description: post.truncated_body_text,
        pubDate: parseDate(post.post_date),
        author: post.publishedByLines,
        category: post.audience,
        // TODO: add preview images
    }));

    if (allowPaid === 'false') {
        posts = posts.filter((post) => post.category !== 'only_paid');
    }

    ctx.state.data = {
        title: `Substack Explore - ${mappedCategory.readableName}`,
        image: 'https://substackcdn.com/icons/substack/favicon.ico',
        link: `https://substack.com/browse/${category}`,
        item: posts,
    };
};
