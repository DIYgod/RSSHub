import { load } from 'cheerio';
import type { Context } from 'hono';
import pMap from 'p-map';

import type { DataItem, Route } from '@/types';
import cache from '@/utils/cache';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

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
function parsePublicationDate(value: string | undefined) {
    if (!value) {
        return;
    }
    const date = parseDate(value, 'YYYY年MM月DD日 HH:mm:ss', true);
    return Number.isFinite(date.getTime()) ? timezone(date, 8) : undefined;
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
    const items = await unwrapFirstFailure(
        pMap(
            list,
            async (item) => {
                const detail = await cache.tryGet(`whb:main-article:${item.link}`, async () => {
                    const response = await ofetch(item.link!);
                    const $ = load(response);
                    const body = $('.content_info');
                    if (body.length !== 1) {
                        throw new Error(`Article body not found at ${item.link}`);
                    }
                    removeEditorialFooter($, body);
                    const dateAndAuthor = $('.content_other').text();
                    const dateString = dateAndAuthor.match(/(?:^|\n)\s*日期[:：]\s*([^\n]+)/)?.[1]?.trim();
                    return {
                        author: dateAndAuthor.match(/(?:^|\n)\s*作者[:：]\s*([^\n]+)/)?.[1]?.trim() || undefined,
                        description: body.html(),
                        pubDate: parsePublicationDate(dateString),
                    };
                });
                return { ...item, author: detail.author, description: detail.description, pubDate: detail.pubDate };
            },
            { concurrency: 3, stopOnError: false }
        )
    );
    return {
        title: `文汇报 - ${categoryName}`,
        link: url,
        item: items.filter((item) => item.description),
    };
}
async function unwrapFirstFailure<T>(promise: Promise<T>): Promise<T> {
    try {
        return await promise;
    } catch (error) {
        throw error instanceof AggregateError ? error.errors[0] : error;
    }
}
