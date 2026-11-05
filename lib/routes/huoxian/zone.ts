import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

function getPublicationDate(value?: string) {
    if (!value) {
        return;
    }
    const date = parseDate(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
}

export const route: Route = {
    path: '/zone',
    categories: ['bbs'],
    example: '/huoxian/zone',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Zone',
    maintainers: ['p7e4'],
    handler,
};

async function handler() {
    const { data } = await got('https://zone.huoxian.cn/api/discussions?sort=-createdAt');
    const items = data.data.map((item) => {
        const firstPost = item.relationships.firstPost.data;
        const post = data.included.find((i) => i.id === firstPost.id && i.type === firstPost.type);
        if (!post) {
            throw new Error(`Huoxian did not include the first post for discussion ${item.id}.`);
        }
        const user = item.relationships.user.data;
        const author = user && data.included.find((i) => i.id === user.id && i.type === user.type);
        return {
            title: item.attributes.title,
            link: `https://zone.huoxian.cn/d/${item.attributes.slug}`,
            description: post.attributes.contentHtml,
            pubDate: getPublicationDate(item.attributes.createdAt),
            author: author?.attributes.displayName,
            category: data.included.filter((i) => item.relationships.tags.data.map((t) => t.id).includes(i.id) && i.type === 'tags').map((i) => i.attributes.name),
        };
    });
    return {
        title: '火线 Zone-安全攻防社区',
        link: 'https://zone.huoxian.cn/',
        item: items,
    };
}
