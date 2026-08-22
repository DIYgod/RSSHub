import type { Context } from 'hono';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/mindmap/:lang?',
    categories: ['study'],
    example: '/xmind/mindmap',
    parameters: { lang: 'language code, all languages by default' },
    name: 'Mindmap Gallery',
    maintainers: ['nczitzk'],
    handler,
    description: `| English | Español | Deutsch | Français | 中文 | 日本語 |
| ------- | ------- | ------- | -------- | ---- | ------ |
| en      | es      | de      | fr       | zh   | jp     |`,
};

async function handler(ctx: Context) {
    const { lang = '' } = ctx.req.param();

    const response = await ofetch(`https://www.xmind.net/_api/share/featured-maps?limit=20&lang=${lang}`);

    return {
        title: 'Mindmap Gallery - XMind',
        link: 'https://www.xmind.net/share',
        item: response.mapList.map((item) => ({
            title: item.topic,
            link: `https://www.xmind.net/${item.id}`,
            description: `<img src="${item.previewUrl}">`,
            pubDate: parseDate(item.created),
            author: item.profileName,
        })),
    };
}
