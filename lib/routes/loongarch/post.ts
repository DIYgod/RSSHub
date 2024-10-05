import { parseDate } from '@/utils/parse-date';
import got from '@/utils/got';

export const route: Route = {
    path: '/post/:type?',
    categories: ['bbs'],
    example: '/loongarch/post/newest',
    parameters: { type: 'top 或 newest' },
    radar: [
        {
            source: ['bbs.loongarch.org'],
        },
    ],
    name: '最热 / 最新帖子',
    maintainers: ['ladeng07', '3401797899'],
    handler,
    url: 'bbs.loongarch.org/',
};

async function handler(ctx) {
    const type = ctx.req.param('type');
    const link = 'https://bbs.loongarch.org/api/discussions';

    let title = '最新帖子';
    let sortValue = '-createdAt';
    if (type === 'top') {
        title = '最热帖子';
        sortValue = '-commentCount';
    }

    const { data: response } = await got('https://bbs.loongarch.org/api/discussions', {
        searchParams: {
            include: 'user,tags,tags.parent,firstPost',
            sort: sortValue,
            'page[offset]': 0,
        },
    });

    const users = response.included.filter((i) => i.type === 'users');
    const tags = response.included.filter((i) => i.type === 'tags');
    const posts = response.included.filter((i) => i.type === 'posts');

    const out = response.data.map(({ attributes, relationships }) => ({
        title: attributes.title,
        link: `https://bbs.loongarch.org/d/${attributes.slug}`,
        author: users.find((i) => i.id === relationships.user.data.id).attributes.displayName,
        description: posts.find((i) => i.id === relationships.firstPost.data.id).attributes.contentHtml,
        pubDate: parseDate(attributes.createdAt),
        updated: parseDate(attributes.lastPostedAt),
        category: relationships.tags.data.map((tag) => tags.find((i) => i.id === tag.id).attributes.name),
    }));

    return {
        title: `LA UOSC-${title}`,
        link,
        description: `LA UOSC-${title}`,
        item: out,
    };
}
