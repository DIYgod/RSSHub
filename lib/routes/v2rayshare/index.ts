import type { Route } from '@/types';
import got from '@/utils/got'; // Shared request helper.
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/',
    categories: ['other'],
    example: '/v2rayshare',
    radar: [
        {
            source: ['v2rayshare.com/'],
            target: '',
        },
    ],
    name: '免费节点',
    description: '获取来自 V2rayShare 的免费节点，可以通过链接复制或下载',
    maintainers: ['77taibai'],
    handler,
    url: 'v2rayshare.com/',
};
async function handler() {
    const { data: response } = await got('https://v2rayshare.com/wp-json/wp/v2/posts/?per_page=10&_embed=author,wp:term');
    const items = response.map((item) => ({
        title: item.title.rendered,
        link: item.link,
        author:
            item._embedded?.author
                ?.map((author) => author.name)
                .filter(Boolean)
                .join(', ') || undefined,
        category: [...new Set<string>(item._embedded?.['wp:term']?.flatMap((terms) => terms.map((term) => term.name).filter((name) => typeof name === 'string')))],
        pubDate: parsePublicationDate(item.date_gmt),
        description: item.content.rendered,
    }));
    return {
        title: 'V2rayShare',
        link: 'https://v2rayshare.com/',
        description: '免费节点分享网站',
        item: items,
    };
}
function parsePublicationDate(value?: string) {
    if (typeof value !== 'string' || !value) {
        return;
    }
    const date = parseDate(value, 'YYYY-MM-DDTHH:mm:ss', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 0) : undefined;
}
