import { Route } from '@/types';

import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/changelog',
    categories: ['program-update'],
    example: '/cursor/changelog',
    url: 'www.cursor.com/changelog',
    name: 'Changelog',
    maintainers: ['p3psi-boo'],
    radar: [
        {
            source: ['www.cursor.com/changelog'],
            target: '/cursor/changelog',
        },
    ],
    handler,
};

async function handler() {
    const url = 'https://www.cursor.com/changelog';

    const response = await got({
        method: 'get',
        url,
    });

    const $ = load(response.data);

    const alist = $('article');

    const list = alist.toArray().map((item) => {
        const leftSide = item.firstChild! as unknown as Element;
        const version = $(leftSide.firstChild!).text();
        const dateLabel = $(leftSide.lastChild!).text();
        const date = parseDate(dateLabel);

        // 从第二个子元素开始到结束都是内容
        const content = item.children
            .slice(1)
            .map((child) => $(child).html())
            .join('');
        const titleElement = $('h2 a', item);
        const link = titleElement.attr('href');
        const title = titleElement.text();

        return {
            title: `${version} - ${title}`,
            description: content,
            link: `https://www.cursor.com${link}`,
            pubDate: date,
        };
    });

    return {
        title: 'Cursor Changelog',
        link: 'https://www.cursor.com/changelog',
        item: list,
    };
}
