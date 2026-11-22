import type { Route } from '@/types';
import cache from '@/utils/cache';

import { cnuFetch, parseContent } from './utils';

export const route: Route = {
    path: '/selected',
    categories: ['picture'],
    example: '/cnu.cc/selected',
    name: '每日精选',
    maintainers: ['hoilc'],
    handler,
};

async function handler() {
    const url = 'http://www.cnu.cc/selectedsFlow/1';

    const listResponse = await cnuFetch(url);
    const data = JSON.parse(listResponse);

    const list = data.data.flatMap((day) =>
        day.works.map((work) => ({
            title: work.title,
            link: `http://www.cnu.cc/works/${work.id}`,
        }))
    );

    const out = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                let result;
                try {
                    const response = await cnuFetch(item.link);
                    result = parseContent(response);
                } catch {
                    return '';
                }
                if (!result.description) {
                    return '';
                }

                return {
                    ...item,
                    author: result.author,
                    description: result.description,
                    pubDate: result.pubDate,
                };
            })
        )
    );

    return {
        title: 'CNU视觉联盟 - 每日精选',
        link: 'http://www.cnu.cc/selectedPage',
        item: out.filter(Boolean),
    };
}
