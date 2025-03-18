import { Route } from '@/types';
import got from '@/utils/got';
import { SUB_NAME_PREFIX, SUB_URL } from './const';
import loadArticle from './article';
import { WPPost } from './types';

export const route: Route = {
    path: '/tag/:tag',
    categories: ['picture'],
    example: '/cosplaytele/tag/aqua',
    parameters: { tag: 'Tag' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['cosplaytele.com/tag/:tag'],
            target: '/tag/:tag',
        },
    ],
    name: 'Tag',
    maintainers: ['AiraNadih'],
    handler,
    url: 'cosplaytele.com/',
};

async function handler(ctx) {
    const limit = Number.parseInt(ctx.req.query('limit')) || 20;
    const tag = ctx.req.param('tag');
    const tagUrl = `${SUB_URL}tag/${tag}/`;

    const {
        data: [{ id: tagId }],
    } = await got(`${SUB_URL}wp-json/wp/v2/tags?slug=${tag}`);
    const { data: posts } = await got(`${SUB_URL}wp-json/wp/v2/posts?tags=${tagId}&per_page=${limit}`);

    return {
        title: `${SUB_NAME_PREFIX} - Tag: ${tag}`,
        link: tagUrl,
        item: posts.map((post) => loadArticle(post as WPPost)),
    };
}
