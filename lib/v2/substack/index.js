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
    const { category, allowPaid = 'false', limit = '36' } = ctx.params;

    const mappedCategory = SUBSTACK_CATEGORIES[category];
    if (!mappedCategory) {
        throw Error('Invalid Substack category. Please check the docs on how to set a correct category.');
    }

    const parsedLimit = Number(limit);
    if (!parsedLimit) {
        throw Error('Could not parse limit parameter. Please check if it is a valid number between 1 and 36.');
    } else if (!(parsedLimit >= 1 && parsedLimit <= 36) || parsedLimit % 1 !== 0) {
        throw Error('Invalid limit. It needs to be a number between 1 and 36.');
    }

    let url;
    if (category === 'staff-picks') {
        url = `${SUBSTACK_API_BASE_URL}/reader/posts/staff-picks`;
    } else {
        url = `${SUBSTACK_API_BASE_URL}/trending?category_id=${mappedCategory.id}&limit=${limit}`;
    }

    const { data } = await got(url, {
        headers: {
            accept: '*/*',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/114.0',
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

    const parsedAllowPaid = allowPaid.toLowerCase() === 'true';
    if (!parsedAllowPaid) {
        posts = posts.filter((post) => post.category !== 'only_paid');
    }

    ctx.state.data = {
        title: `Substack Explore - ${mappedCategory.readableName}`,
        image: 'https://substackcdn.com/icons/substack/favicon.ico',
        link: `https://substack.com/browse/${category}`,
        item: posts,
    };
};
