import { Route } from '@/types';
import got from '@/utils/got';

async function getCategoryId(categories) {
    const baseUrl = `https://macmenubar.com/wp-json/wp/v2/categories`;
    const { data: response } = await got(baseUrl, {
        method: 'GET',
        searchParams: {
            slug: categories,
        },
    });
    return response.reduce((queryString, item) => queryString + item.id + ',', '');
}

export const route: Route = {
    path: '/recently/:category?',
    categories: ['blog'],
    example: '/macmenubar/recently/developer-apps,system-tools',
    parameters: { category: 'Category path name, seperate by comma, default is all categories. Category path name can be found in url' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Recently',
    maintainers: ['5upernova-heng'],
    handler,
};

async function handler(ctx) {
    const baseUrl = 'https://macmenubar.com/wp-json/wp/v2/posts';
    const categories = ctx.req.param('category');
    const searchParams = {
        per_page: 100,
    };
    if (categories) {
        searchParams.categories = await getCategoryId(categories);
    }
    const response = await got(baseUrl, {
        method: 'GET',
        searchParams,
    });
    const items = response.data.map((post) => {
        const title = post.title.rendered;
        const link = post.link;
        const pubDate = post.date_gmt;
        const description = post.content.rendered;
        const tags = post.tag_info.map((tag) => tag.name);
        const categories = post.category_info.map((category) => category.name);
        return {
            title,
            link,
            pubDate,
            description,
            category: [...tags, ...categories],
        };
    });
    return {
        title: 'Recent Posts | MacMenuBar.com',
        link: 'https://macmenubar.com/recently-added/',
        item: items,
    };
}
