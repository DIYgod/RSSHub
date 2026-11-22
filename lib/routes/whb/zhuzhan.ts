import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/time';

export const route: Route = {
    path: '/:category',
    categories: ['traditional-media'],
    example: '/whb/bihui',
    parameters: { category: '文汇报分类名，可在该分类的 URL 中找到（即 https://www.whb.cn/zhuzhan/:category/index.html)' },
    name: '分类',
    maintainers: ['hoilc'],
    handler,
};
function removeEditorialFooter($, body) {
    body.find('section.whb_ueditor').each((_, element) => {
        const section = $(element);
        const paragraphs = section
            .find('p')
            .toArray()
            .map((paragraph) => $(paragraph).text().trim())
            .filter(Boolean);
        if (paragraphs.length && paragraphs.every((paragraph) => /^(?:作者|编辑|责任编辑)[:：]/.test(paragraph))) {
            section.remove();
        }
    });
    const notice = body.children('p').last();
    if (notice.text().trim() === '*文汇独家稿件，转载请注明出处。') {
        notice.remove();
    }
}
async function handler(ctx: Context) {
    const { category } = ctx.req.param();
    const base = 'https://www.whb.cn';
    const url = `${base}/zhuzhan/${category}/index.html`;
    const listResponse = await ofetch(url);
    const $ = load(listResponse);
    const categoryName = $('.title_jingpinhui > a').first().text();
    const list = $('.info_jingpinhui')
        .toArray()
        .map((item): DataItem => {
            const title = $(item).find('.title > a');
            return {
                title: title.text(),
                link: new URL(title.attr('href')!, url).href,
            };
        });
    const items = await pMap(
        list,
        async (item) => {
            const detail = await cache.tryGet(`whb:main-article:${item.link}`, async () => {
                const response = await ofetch(item.link!);
                const $ = load(response);
                const body = $('.content_info');
                removeEditorialFooter($, body);
                const dateAndAuthor = $('.content_other').text();
                const dateString = dateAndAuthor.match(/(?:^|\n)\s*日期[:：]\s*([^\n]+)/)![1];
                return {
                    author: dateAndAuthor.match(/(?:^|\n)\s*作者[:：]\s*([^\n]+)/)![1],
                    description: body.html(),
                    pubDate: parseDate(dateString, 'YYYY年MM月DD日 HH:mm:ss', 8),
                };
            });
            return { ...item, author: detail.author, description: detail.description, pubDate: detail.pubDate };
        },
        { concurrency: 3 }
    );
    return {
        title: `文汇报 - ${categoryName}`,
        link: url,
        item: items.filter((item) => item.description),
    };
}
