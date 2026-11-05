import MarkdownIt from 'markdown-it';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const md = MarkdownIt();

export const route: Route = {
    path: '/notice',
    categories: ['program-update'],
    example: '/simpread/notice',
    name: '消息通知',
    maintainers: ['zytomorrow'],
    handler,
};

async function handler() {
    const response = await ofetch('https://static.simp.red/notice');

    return {
        title: 'SimpRead 消息通知',
        link: 'https://simpread.pro/changelog.html',
        description: 'SimpRead 消息通知',
        item: response.notice.map((item) => ({
            guid: `simpread:notice:${item.id}`,
            description: md.render(item.content),
            link: 'https://simpread.pro/changelog.html',
            pubDate: item.date ? parseDate(`${item.date} +0000`, 'YYYY-MM-DD HH:mm ZZ') : undefined,
            title: `${item.category.name}-${item.title}`,
            author: 'SimpRead',
            category: item.category.name,
        })),
    };
}
