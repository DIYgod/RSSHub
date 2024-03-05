// @ts-nocheck
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { body: response } = await got('https://huggingface.co/blog/zh');
    const $ = load(response);

    /** @type {Array<{blog: {local: string, title: string, author: string, thumbnail: string, date: string, tags: Array<string>}, blogUrl: string, lang: 'zh', link: string}>} */
    const papers = $('div[data-target="BlogThumbnail"]')
        .toArray()
        .map((item) => {
            const props = $(item).data('props');
            const link = $(item).find('a').attr('href');
            return {
                ...props,
                link,
            };
        });

    const items = papers.map((item) => ({
        title: item.blog.title,
        link: `https://huggingface.co${item.link}`,
        category: item.blog.tags,
        pubDate: parseDate(item.blog.date),
        author: item.blog.author,
    }));

    ctx.set('data', {
        title: 'Huggingface 中文博客',
        link: 'https://huggingface.co/blog/zh',
        item: items,
    });
};
