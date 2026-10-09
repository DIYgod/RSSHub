import { load } from 'cheerio';

import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/new-books/:category?',
    example: '/ireader/new-books/320',
    name: '新书上架',
    categories: ['reading'],
    maintainers: ['DIYgod'],
    parameters: { category: '分类 ID，对应网站 cid 参数，默认 320（计算机）。' },
    description: 'Uses the website’s newest-first new-book selection (order=update, status=4). Select a native book category using its cid value.',
    radar: [{ source: ['pweb.d.ireader.com/index.php', 'www.ireader.com/index.php'], target: '/new-books/320' }],
    handler,
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? '320';
    const link = `https://pweb.d.ireader.com/index.php?ca=booksort.index&pid=92&cid=${encodeURIComponent(category)}&order=update&status=4`;
    const response = await ofetch(link);
    const $ = load(response);
    return {
        title: `掌阅 iReader - 新书上架 - ${category}`,
        link,
        language: 'zh-CN' as const,
        item: $('.bookMation')
            .toArray()
            .map((element) => {
                const book = $(element);
                const title = book.find('h3 a');
                const author = book.find('.tryread');
                author.find('a').remove();
                const date = book
                    .find('span')
                    .text()
                    .match(/\d{4}-\d{2}-\d{2}/)?.[0];
                const cover = book.parent().find('img').attr('src');
                return {
                    title: title.text(),
                    link: title.attr('href'),
                    author: author.text().trim(),
                    description: `${cover ? `<img src="${cover}">` : ''}${book.find('.introduce').html() || ''}`,
                    pubDate: date ? parseDate(date, 'YYYY-MM-DD') : undefined,
                };
            }),
    };
}
